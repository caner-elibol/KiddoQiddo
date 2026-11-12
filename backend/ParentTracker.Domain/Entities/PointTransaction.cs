using ParentTracker.Domain.Enums;

namespace ParentTracker.Domain.Entities;

public class PointTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChildId { get; set; }
    public PointSourceType SourceType { get; set; }
    public Guid? SourceId { get; set; }
    public int Points { get; set; }
    public int BalanceAfter { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Child Child { get; set; } = null!;
}
