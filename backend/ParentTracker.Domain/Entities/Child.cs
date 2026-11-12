using ParentTracker.Domain.Common;

namespace ParentTracker.Domain.Entities;

public class Child : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Guid ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? BirthYear { get; set; }
    public string AvatarKey { get; set; } = "star";
    public string PinCodeHash { get; set; } = string.Empty;
    public int Level { get; set; } = 1;
    public int TotalPoints { get; set; } = 0;
    public int TotalLifetimePoints { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public Family Family { get; set; } = null!;
    public User Parent { get; set; } = null!;
    public ICollection<ChildTask> ChildTasks { get; set; } = new List<ChildTask>();
    public ICollection<RewardRequest> RewardRequests { get; set; } = new List<RewardRequest>();
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
