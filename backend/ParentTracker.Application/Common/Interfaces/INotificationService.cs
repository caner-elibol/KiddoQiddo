using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Common.Interfaces;

public interface INotificationService
{
    Task NotifyParent(Guid userId, Guid familyId, string title, string body,
        NotificationType type, CancellationToken ct = default);

    Task NotifyChild(Guid childId, Guid familyId, string title, string body,
        NotificationType type, CancellationToken ct = default);

    Task NotifyFamily(Guid familyId, string title, string body,
        NotificationType type, CancellationToken ct = default);
}
