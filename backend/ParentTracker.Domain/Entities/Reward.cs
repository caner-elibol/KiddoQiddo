using ParentTracker.Domain.Common;

namespace ParentTracker.Domain.Entities;

public class Reward : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Guid ParentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int RequiredPoints { get; set; }
    public bool IsActive { get; set; } = true;

    public Family Family { get; set; } = null!;
    public User Parent { get; set; } = null!;
    public ICollection<RewardRequest> Requests { get; set; } = new List<RewardRequest>();
    public ICollection<RewardAssignment> Assignments { get; set; } = new List<RewardAssignment>();
}
