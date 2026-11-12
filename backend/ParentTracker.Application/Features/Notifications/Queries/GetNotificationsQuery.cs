using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(int Page = 1, int PageSize = 20) : IRequest<NotificationsResult>;

public record NotificationDto(Guid Id, string Title, string Body, string Type, bool IsRead, DateTimeOffset CreatedAt);

public record NotificationsResult(List<NotificationDto> Items, int UnreadCount);

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, NotificationsResult>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<NotificationsResult> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.InAppNotification> query;

        if (_currentUser.ChildId.HasValue)
            query = _db.InAppNotifications.Where(n => n.ChildId == _currentUser.ChildId);
        else if (_currentUser.UserId != Guid.Empty)
            query = _db.InAppNotifications.Where(n => n.UserId == _currentUser.UserId);
        else
            throw new UnauthorizedAccessException();

        var unreadCount = await query.CountAsync(n => !n.IsRead, cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Body, n.Type.ToString(), n.IsRead, n.CreatedAt))
            .ToListAsync(cancellationToken);

        return new NotificationsResult(items, unreadCount);
    }
}
