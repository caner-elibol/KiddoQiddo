using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Application.Features.Tasks.Commands;

public record AssignTaskCommand(Guid TaskItemId, Guid ChildId) : IRequest<Guid>;

public class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IChildTaskGeneratorService _taskGenerator;

    public AssignTaskCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IChildTaskGeneratorService taskGenerator)
    {
        _db = db;
        _currentUser = currentUser;
        _taskGenerator = taskGenerator;
    }

    public async Task<Guid> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var taskItem = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskItemId && t.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Görev bulunamadı.");

        _ = await _db.Children
            .FirstOrDefaultAsync(c => c.Id == request.ChildId && c.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Çocuk bulunamadı.");

        var existing = await _db.TaskAssignments
            .FirstOrDefaultAsync(a => a.TaskItemId == request.TaskItemId && a.ChildId == request.ChildId && a.IsActive, cancellationToken);

        if (existing is not null)
            return existing.Id;

        var assignment = new TaskAssignment
        {
            TaskItemId = request.TaskItemId,
            ChildId = request.ChildId,
            IsActive = true
        };

        _db.TaskAssignments.Add(assignment);
        await _db.SaveChangesAsync(cancellationToken);

        await _taskGenerator.GenerateForAssignment(request.TaskItemId, [request.ChildId], cancellationToken);

        return assignment.Id;
    }
}
