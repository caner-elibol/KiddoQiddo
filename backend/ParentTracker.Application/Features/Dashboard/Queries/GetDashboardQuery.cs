using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Application.Common.Constants;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Dashboard.Queries;

public record GetDashboardQuery : IRequest<DashboardDto>;

public record DashboardDto(
    int TotalChildren,
    int PendingApprovals,
    int PendingRewardRequests,
    string FamilyCode,
    List<ChildSummaryDto> Children);

public record ChildSummaryDto(
    Guid Id,
    string Name,
    string? AvatarKey,
    int TotalPoints,
    int Level,
    int TodayTasksCompleted,
    int TodayTasksTotal);

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<DashboardDto> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var family = await _db.Families
            .FirstOrDefaultAsync(f => f.Id == familyId, cancellationToken);

        var children = await _db.Children
            .Where(c => c.FamilyId == familyId && c.IsActive)
            .ToListAsync(cancellationToken);

        var pendingApprovals = await _db.ChildTasks
            .Where(ct => ct.Child.FamilyId == familyId && ct.Status == ChildTaskStatus.Submitted)
            .CountAsync(cancellationToken);

        var pendingRewards = await _db.RewardRequests
            .Where(rr => rr.Child.FamilyId == familyId && rr.Status == RewardRequestStatus.Requested)
            .CountAsync(cancellationToken);

        var childIds = children.Select(c => c.Id).ToList();

        var todayTaskStats = await _db.ChildTasks
            .Where(ct => childIds.Contains(ct.ChildId) && ct.ScheduledDate == today)
            .GroupBy(ct => ct.ChildId)
            .Select(g => new
            {
                ChildId = g.Key,
                Total = g.Count(),
                Completed = g.Count(ct => ct.Status == ChildTaskStatus.Submitted || ct.Status == ChildTaskStatus.Approved)
            })
            .ToListAsync(cancellationToken);

        var childSummaries = children.Select(c =>
        {
            var stats = todayTaskStats.FirstOrDefault(s => s.ChildId == c.Id);
            return new ChildSummaryDto(
                c.Id,
                c.Name,
                c.AvatarKey,
                c.TotalPoints,
                LevelThresholds.CalculateLevel(c.TotalLifetimePoints),
                stats?.Completed ?? 0,
                stats?.Total ?? 0);
        }).ToList();

        return new DashboardDto(children.Count, pendingApprovals, pendingRewards, family?.FamilyCode ?? "", childSummaries);
    }
}
