using MediatR;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Tasks.Commands;

public record CreateTaskItemCommand(
    string Title,
    string? Description,
    string Category,
    int Points,
    TaskRepeatType RepeatType,
    bool RequiresParentApproval,
    DateOnly? StartDate,
    DateOnly? EndDate) : IRequest<Guid>;

public class CreateTaskItemCommandHandler : IRequestHandler<CreateTaskItemCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTaskItemCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateTaskItemCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.FamilyId == Guid.Empty) throw new UnauthorizedAccessException();

        var task = new TaskItem
        {
            FamilyId = _currentUser.FamilyId,
            ParentId = _currentUser.UserId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            Points = request.Points,
            RepeatType = request.RepeatType,
            RequiresParentApproval = request.RequiresParentApproval,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}
