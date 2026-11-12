using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Infrastructure.Services;

public class ChildTaskGeneratorService : IChildTaskGeneratorService
{
    private readonly IApplicationDbContext _db;
    private readonly ILogger<ChildTaskGeneratorService> _logger;

    public ChildTaskGeneratorService(IApplicationDbContext db, ILogger<ChildTaskGeneratorService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task GenerateForDate(DateOnly date, CancellationToken ct = default)
    {
        var assignments = await _db.TaskAssignments
            .Include(a => a.TaskItem)
            .Include(a => a.Child)
            .Where(a => a.IsActive && a.TaskItem.IsActive)
            .ToListAsync(ct);

        var newTasks = new List<ChildTask>();

        foreach (var assignment in assignments)
        {
            if (!ShouldGenerateForDate(assignment.TaskItem, date))
                continue;

            var alreadyExists = await _db.ChildTasks
                .AnyAsync(ct2 => ct2.ChildId == assignment.ChildId && ct2.TaskItemId == assignment.TaskItemId && ct2.ScheduledDate == date, ct);

            if (alreadyExists)
                continue;

            newTasks.Add(new ChildTask
            {
                ChildId = assignment.ChildId,
                TaskItemId = assignment.TaskItemId,
                ScheduledDate = date,
                PointsAwarded = CalculateDailyPoints(assignment.TaskItem, date),
                Status = ChildTaskStatus.Pending
            });
        }

        if (newTasks.Count > 0)
        {
            _db.ChildTasks.AddRange(newTasks);
            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Generated {Count} child tasks for {Date}", newTasks.Count, date);
        }
    }

    public async Task GenerateForAssignment(Guid taskItemId, List<Guid> childIds, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var taskItem = await _db.Tasks.FindAsync([taskItemId], ct)
            ?? throw new InvalidOperationException($"TaskItem {taskItemId} not found.");

        if (!ShouldGenerateForDate(taskItem, today))
            return;

        var newTasks = childIds
            .Select(childId => new ChildTask
            {
                ChildId = childId,
                TaskItemId = taskItemId,
                ScheduledDate = today,
                PointsAwarded = CalculateDailyPoints(taskItem, today),
                Status = ChildTaskStatus.Pending
            })
            .ToList();

        _db.ChildTasks.AddRange(newTasks);
        await _db.SaveChangesAsync(ct);
    }

    public async Task MarkMissedTasks(CancellationToken ct = default)
    {
        var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        await _db.ChildTasks
            .Where(t => t.ScheduledDate <= yesterday && t.Status == ChildTaskStatus.Pending)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.Status, ChildTaskStatus.Missed), ct);
    }

    private static bool ShouldGenerateForDate(TaskItem taskItem, DateOnly date)
    {
        return taskItem.RepeatType switch
        {
            TaskRepeatType.Daily => true,
            TaskRepeatType.Weekly => true,
            TaskRepeatType.Custom => taskItem.StartDate.HasValue && taskItem.EndDate.HasValue
                && date >= taskItem.StartDate.Value
                && date <= taskItem.EndDate.Value,
            TaskRepeatType.Once => false,
            _ => false
        };
    }

    // For Custom (date-range) tasks: distribute total points evenly across all days in the range.
    // For all other types: return the configured points as-is.
    private static int CalculateDailyPoints(TaskItem taskItem, DateOnly date)
    {
        if (taskItem.RepeatType == TaskRepeatType.Custom
            && taskItem.StartDate.HasValue
            && taskItem.EndDate.HasValue)
        {
            var totalDays = taskItem.EndDate.Value.DayNumber - taskItem.StartDate.Value.DayNumber + 1;
            if (totalDays <= 1) return taskItem.Points;

            var dayIndex = date.DayNumber - taskItem.StartDate.Value.DayNumber; // 0-based
            var isLastDay = dayIndex == totalDays - 1;

            var basePoints = taskItem.Points / totalDays;
            var remainder = taskItem.Points % totalDays;

            // Give the remainder to the last day so total always equals TaskItem.Points
            return isLastDay ? basePoints + remainder : basePoints;
        }

        return taskItem.Points;
    }
}
