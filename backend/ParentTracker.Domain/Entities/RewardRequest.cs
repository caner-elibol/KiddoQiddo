using ParentTracker.Domain.Enums;

namespace ParentTracker.Domain.Entities;

public class RewardRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChildId { get; set; }
    public Guid RewardId { get; set; }
    public RewardRequestStatus Status { get; set; } = RewardRequestStatus.Requested;
    public DateTimeOffset RequestedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ApprovedAt { get; set; }
    public DateTimeOffset? RejectedAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public Guid? RejectedByUserId { get; set; }
    public string? Note { get; set; }

    public Child Child { get; set; } = null!;
    public Reward Reward { get; set; } = null!;
}
