using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Tasks.Commands;

public record SubmitTaskCommand(Guid ChildTaskId, string? Note) : IRequest;

public class SubmitTaskCommandHandler : IRequestHandler<SubmitTaskCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;
    private readonly IPointService _pointService;

    public SubmitTaskCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        INotificationService notifications,
        IPointService pointService)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
        _pointService = pointService;
    }

    public async Task Handle(SubmitTaskCommand request, CancellationToken cancellationToken)
    {
        var childId = _currentUser.ChildId ?? throw new UnauthorizedAccessException();

        var childTask = await _db.ChildTasks
            .Include(ct => ct.TaskItem)
            .Include(ct => ct.Child)
            .FirstOrDefaultAsync(ct => ct.Id == request.ChildTaskId && ct.ChildId == childId, cancellationToken)
            ?? throw new KeyNotFoundException("Görev bulunamadı.");

        if (childTask.Status != ChildTaskStatus.Pending)
            throw new InvalidOperationException("Görev zaten tamamlandı veya onaylanıyor.");

        childTask.SubmittedAt = DateTimeOffset.UtcNow;

        if (childTask.TaskItem.RequiresParentApproval)
        {
            childTask.Status = ChildTaskStatus.Submitted;

            await _db.SaveChangesAsync(cancellationToken);

            var parents = await _db.FamilyMembers
                .Where(fm => fm.FamilyId == childTask.Child.FamilyId && fm.Role == UserRole.Parent)
                .ToListAsync(cancellationToken);

            foreach (var parent in parents)
            {
                await _notifications.NotifyParent(
                    parent.UserId,
                    childTask.Child.FamilyId,
                    "Görev Onay Bekliyor",
                    $"'{childTask.TaskItem.Title}' görevi onay bekliyor.",
                    NotificationType.TaskSubmitted,
                    cancellationToken);
            }
        }
        else
        {
            childTask.Status = ChildTaskStatus.Approved;
            childTask.ApprovedAt = DateTimeOffset.UtcNow;
            childTask.PointsAwarded = childTask.TaskItem.Points;

            await _db.SaveChangesAsync(cancellationToken);

            await _pointService.AwardPoints(
                childTask.ChildId,
                childTask.PointsAwarded,
                PointSourceType.Task,
                childTask.Id,
                $"Görev tamamlandı: {childTask.TaskItem.Title}",
                cancellationToken);

            await _notifications.NotifyChild(
                childTask.ChildId,
                childTask.Child.FamilyId,
                "Görev Tamamlandı",
                $"'{childTask.TaskItem.Title}' görevi tamamlandı! +{childTask.PointsAwarded} puan kazandın.",
                NotificationType.TaskApproved,
                cancellationToken);
        }
    }
}
