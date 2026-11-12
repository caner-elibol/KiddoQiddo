using ParentTracker.Domain.Common;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Domain.Entities;

public class TaskItem : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Guid ParentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public int Points { get; set; }
    public bool RequiresParentApproval { get; set; } = true;
    public TaskRepeatType RepeatType { get; set; } = TaskRepeatType.Daily;
    public string? RepeatDays { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Family Family { get; set; } = null!;
    public User Parent { get; set; } = null!;
    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    public ICollection<ChildTask> ChildTasks { get; set; } = new List<ChildTask>();
}
