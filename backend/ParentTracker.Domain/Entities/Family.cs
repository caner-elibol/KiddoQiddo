using ParentTracker.Domain.Common;

namespace ParentTracker.Domain.Entities;

public class Family : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string FamilyCode { get; set; } = string.Empty;
    public Guid OwnerParentId { get; set; }

    public User OwnerParent { get; set; } = null!;
    public ICollection<FamilyMember> Members { get; set; } = new List<FamilyMember>();
    public ICollection<Child> Children { get; set; } = new List<Child>();
}
