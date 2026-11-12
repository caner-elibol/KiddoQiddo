using ParentTracker.Domain.Common;

namespace ParentTracker.Domain.Entities;

public class RewardAssignment : BaseEntity
{
    public Guid RewardId { get; set; }
    public Guid ChildId { get; set; }
    public bool IsActive { get; set; } = true;

    public Reward Reward { get; set; } = null!;
    public Child Child { get; set; } = null!;
}
