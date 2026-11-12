using ParentTracker.Domain.Common;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Domain.Entities;

public class FamilyMember : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Guid UserId { get; set; }
    public UserRole Role { get; set; } = UserRole.Parent;

    public Family Family { get; set; } = null!;
    public User User { get; set; } = null!;
}
