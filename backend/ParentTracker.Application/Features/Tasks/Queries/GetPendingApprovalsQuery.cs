using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Tasks.Queries;

public record GetPendingApprovalsQuery : IRequest<List<PendingApprovalDto>>;

public record PendingApprovalDto(
    Guid ChildTaskId,
    Guid ChildId,
    string ChildName,
    string TaskTitle,
    int Points,
    DateTimeOffset? SubmittedAt);

public class GetPendingApprovalsQueryHandler : IRequestHandler<GetPendingApprovalsQuery, List<PendingApprovalDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPendingApprovalsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<PendingApprovalDto>> Handle(GetPendingApprovalsQuery request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        return await _db.ChildTasks
            .Include(ct => ct.Child)
            .Include(ct => ct.TaskItem)
            .Where(ct =>
                ct.Child.FamilyId == familyId &&
                ct.Status == ChildTaskStatus.Submitted)
            .OrderBy(ct => ct.SubmittedAt)
            .Select(ct => new PendingApprovalDto(
                ct.Id,
                ct.ChildId,
                ct.Child.Name,
                ct.TaskItem.Title,
                ct.PointsAwarded,
                ct.SubmittedAt))
            .ToListAsync(cancellationToken);
    }
}
