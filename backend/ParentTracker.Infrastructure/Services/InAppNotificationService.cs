using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Infrastructure.Services;

public class InAppNotificationService : INotificationService
{
    private readonly IApplicationDbContext _db;

    public InAppNotificationService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task NotifyParent(Guid userId, Guid familyId, string title, string body, NotificationType type, CancellationToken ct = default)
    {
        _db.InAppNotifications.Add(new InAppNotification
        {
            FamilyId = familyId,
            UserId = userId,
            Title = title,
            Body = body,
            Type = type
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task NotifyChild(Guid childId, Guid familyId, string title, string body, NotificationType type, CancellationToken ct = default)
    {
        _db.InAppNotifications.Add(new InAppNotification
        {
            FamilyId = familyId,
            ChildId = childId,
            Title = title,
            Body = body,
            Type = type
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task NotifyFamily(Guid familyId, string title, string body, NotificationType type, CancellationToken ct = default)
    {
        _db.InAppNotifications.Add(new InAppNotification
        {
            FamilyId = familyId,
            Title = title,
            Body = body,
            Type = type
        });
        await _db.SaveChangesAsync(ct);
    }
}
