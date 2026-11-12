using ParentTracker.Domain.Common;

namespace ParentTracker.Domain.Entities;

public class TaskAssignment : BaseEntity
{
    public Guid TaskItemId { get; set; }
    public Guid ChildId { get; set; }
    public bool IsActive { get; set; } = true;

    public TaskItem TaskItem { get; set; } = null!;
    public Child Child { get; set; } = null!;
}
