using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Constants;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Reports;

public record GetFamilyReportQuery : IRequest<FamilyReportDto>;

public record CompletedTaskDto(
    string Title,
    string Category,
    int Points,
    DateOnly ScheduledDate);

public record ChildReportDto(
    Guid ChildId,
    string Name,
    string AvatarKey,
    int TotalPoints,
    int Level,
    int TasksCompletedThisWeek,
    int TasksPendingApprovalThisWeek,
    int TasksRejectedThisWeek,
    int PointsEarnedThisWeek,
    int RewardRequestsPending,
    List<CompletedTaskDto> CompletedTasksThisWeek);

public record FamilyReportDto(
    List<ChildReportDto> Children,
    DateTimeOffset WeekStart,
    DateTimeOffset WeekEnd);

public class GetFamilyReportQueryHandler : IRequestHandler<GetFamilyReportQuery, FamilyReportDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetFamilyReportQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<FamilyReportDto> Handle(GetFamilyReportQuery request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        // Week boundaries (Mon-Sun)
        var today = DateTimeOffset.UtcNow.Date;
        var dayOfWeek = (int)today.DayOfWeek;
        var daysToMonday = dayOfWeek == 0 ? 6 : dayOfWeek - 1;
        var weekStart = new DateTimeOffset(today.AddDays(-daysToMonday), TimeSpan.Zero);
        var weekEnd = weekStart.AddDays(7);

        var children = await _db.Children
            .Where(c => c.FamilyId == familyId && c.IsActive)
            .ToListAsync(cancellationToken);

        var childIds = children.Select(c => c.Id).ToList();

        var childTasksThisWeek = await _db.ChildTasks
            .Include(ct => ct.TaskItem)
            .Where(ct => childIds.Contains(ct.ChildId)
                && ct.ScheduledDate >= DateOnly.FromDateTime(weekStart.DateTime)
                && ct.ScheduledDate < DateOnly.FromDateTime(weekEnd.DateTime))
            .ToListAsync(cancellationToken);

        // Point transactions this week (positive, i.e. earned not spent)
        var pointsThisWeek = await _db.PointTransactions
            .Where(pt => childIds.Contains(pt.ChildId)
                && pt.Points > 0
                && pt.CreatedAt >= weekStart
                && pt.CreatedAt < weekEnd)
            .GroupBy(pt => pt.ChildId)
            .Select(g => new { ChildId = g.Key, Total = g.Sum(pt => pt.Points) })
            .ToListAsync(cancellationToken);

        var pendingRequests = await _db.RewardRequests
            .Where(rr => childIds.Contains(rr.ChildId) && rr.Status == RewardRequestStatus.Requested)
            .GroupBy(rr => rr.ChildId)
            .Select(g => new { ChildId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = children.Select(child =>
        {
            var tasks = childTasksThisWeek.Where(ct => ct.ChildId == child.Id).ToList();
            var points = pointsThisWeek.FirstOrDefault(p => p.ChildId == child.Id)?.Total ?? 0;
            var pending = pendingRequests.FirstOrDefault(r => r.ChildId == child.Id)?.Count ?? 0;

            var completedTasks = tasks
                .Where(t => t.Status == ChildTaskStatus.Approved)
                .OrderBy(t => t.ScheduledDate)
                .Select(t => new CompletedTaskDto(
                    t.TaskItem.Title,
                    t.TaskItem.Category,
                    t.PointsAwarded,
                    t.ScheduledDate))
                .ToList();

            return new ChildReportDto(
                child.Id,
                child.Name,
                child.AvatarKey,
                child.TotalPoints,
                LevelThresholds.CalculateLevel(child.TotalLifetimePoints),
                tasks.Count(t => t.Status == ChildTaskStatus.Approved),
                tasks.Count(t => t.Status == ChildTaskStatus.Submitted),
                tasks.Count(t => t.Status == ChildTaskStatus.Rejected),
                points,
                pending,
                completedTasks);
        }).OrderBy(c => c.Name).ToList();

        return new FamilyReportDto(result, weekStart, weekEnd);
    }
}
