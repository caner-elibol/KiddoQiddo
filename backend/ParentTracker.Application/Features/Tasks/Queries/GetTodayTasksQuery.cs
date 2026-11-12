using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Tasks.Queries;

public record GetTodayTasksQuery : IRequest<List<TodayTaskDto>>;

public record TodayTaskDto(
    Guid ChildTaskId,
    string Title,
    string Category,
    int Points,
    ChildTaskStatus Status,
    bool RequiresParentApproval);

public class GetTodayTasksQueryHandler : IRequestHandler<GetTodayTasksQuery, List<TodayTaskDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTodayTasksQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<TodayTaskDto>> Handle(GetTodayTasksQuery request, CancellationToken cancellationToken)
    {
        var childId = _currentUser.ChildId ?? throw new UnauthorizedAccessException();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return await _db.ChildTasks
            .Include(ct => ct.TaskItem)
            .Where(ct => ct.ChildId == childId && ct.ScheduledDate == today)
            .OrderBy(ct => ct.TaskItem.Title)
            .Select(ct => new TodayTaskDto(
                ct.Id,
                ct.TaskItem.Title,
                ct.TaskItem.Category,
                ct.PointsAwarded,
                ct.Status,
                ct.TaskItem.RequiresParentApproval))
            .ToListAsync(cancellationToken);
    }
}
