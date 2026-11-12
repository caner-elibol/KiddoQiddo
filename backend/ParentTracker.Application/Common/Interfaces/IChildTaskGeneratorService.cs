namespace ParentTracker.Application.Common.Interfaces;

public interface IChildTaskGeneratorService
{
    Task GenerateForDate(DateOnly date, CancellationToken ct = default);
    Task GenerateForAssignment(Guid taskItemId, List<Guid> childIds, CancellationToken ct = default);
    Task MarkMissedTasks(CancellationToken ct = default);
}
