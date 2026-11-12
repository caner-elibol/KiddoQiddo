using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Tasks.Commands;

public record ApproveTaskCommand(Guid ChildTaskId, bool Approved, string? ParentNote) : IRequest;

public class ApproveTaskCommandHandler : IRequestHandler<ApproveTaskCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IPointService _pointService;
    private readonly INotificationService _notifications;

    public ApproveTaskCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IPointService pointService,
        INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _pointService = pointService;
        _notifications = notifications;
    }

    public async Task Handle(ApproveTaskCommand request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var childTask = await _db.ChildTasks
            .Include(ct => ct.TaskItem)
            .Include(ct => ct.Child)
            .FirstOrDefaultAsync(ct => ct.Id == request.ChildTaskId && ct.Child.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Gorev bulunamadi.");

        if (childTask.Status != ChildTaskStatus.Submitted)
            throw new InvalidOperationException("Gorev onay beklemede degil.");

        childTask.ParentNote = request.ParentNote;

        if (request.Approved)
        {
            childTask.Status = ChildTaskStatus.Approved;
            childTask.ApprovedAt = DateTimeOffset.UtcNow;
            childTask.ApprovedByUserId = _currentUser.UserId;

            await _pointService.AwardPoints(
                childTask.ChildId,
                childTask.PointsAwarded,
                PointSourceType.Task,
                childTask.Id,
                $"Gorev tamamlandi: {childTask.TaskItem.Title}",
                cancellationToken);

            await _notifications.NotifyChild(
                childTask.ChildId,
                familyId,
                "Gorev Onaylandi",
                $"'{childTask.TaskItem.Title}' gorevin onaylandi! +{childTask.PointsAwarded} puan kazandin.",
                NotificationType.TaskApproved,
                cancellationToken);
        }
        else
        {
            childTask.Status = ChildTaskStatus.Rejected;
            childTask.RejectedAt = DateTimeOffset.UtcNow;

            await _notifications.NotifyChild(
                childTask.ChildId,
                familyId,
                "Gorev Reddedildi",
                $"'{childTask.TaskItem.Title}' gorevin reddedildi.",
                NotificationType.TaskRejected,
                cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}

