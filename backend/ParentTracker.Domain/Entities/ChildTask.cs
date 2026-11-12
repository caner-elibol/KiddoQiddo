using ParentTracker.Domain.Common;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Domain.Entities;

public class ChildTask : BaseEntity
{
    public Guid ChildId { get; set; }
    public Guid TaskItemId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public ChildTaskStatus Status { get; set; } = ChildTaskStatus.Pending;
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? RejectedAt { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public int PointsAwarded { get; set; }
    public string? ParentNote { get; set; }

    public Child Child { get; set; } = null!;
    public TaskItem TaskItem { get; set; } = null!;
}
