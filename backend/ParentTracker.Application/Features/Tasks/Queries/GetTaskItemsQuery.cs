using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Tasks.Queries;

public record GetTaskItemsQuery : IRequest<List<TaskItemDto>>;

public record TaskItemDto(
    Guid Id,
    string Title,
    string? Description,
    string Category,
    int Points,
    string RepeatType,
    bool RequiresParentApproval,
    bool IsActive);

public class GetTaskItemsQueryHandler : IRequestHandler<GetTaskItemsQuery, List<TaskItemDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetTaskItemsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<TaskItemDto>> Handle(GetTaskItemsQuery request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        return await _db.Tasks
            .Where(t => t.FamilyId == familyId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskItemDto(
                t.Id,
                t.Title,
                t.Description,
                t.Category,
                t.Points,
                t.RepeatType.ToString(),
                t.RequiresParentApproval,
                t.IsActive))
            .ToListAsync(cancellationToken);
    }
}
