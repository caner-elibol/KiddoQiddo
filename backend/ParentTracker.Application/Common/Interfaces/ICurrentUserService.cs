namespace ParentTracker.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid? ChildId { get; }
    Guid FamilyId { get; }
    string Role { get; }
    bool IsParent { get; }
    bool IsChild { get; }
    bool IsAuthenticated { get; }
}
