using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Notifications.Commands;

public record MarkNotificationsReadCommand(List<Guid>? Ids) : IRequest;

public class MarkNotificationsReadCommandHandler : IRequestHandler<MarkNotificationsReadCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationsReadCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(MarkNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.InAppNotification> query;

        if (_currentUser.ChildId.HasValue)
            query = _db.InAppNotifications.Where(n => n.ChildId == _currentUser.ChildId);
        else if (_currentUser.UserId != Guid.Empty)
            query = _db.InAppNotifications.Where(n => n.UserId == _currentUser.UserId);
        else
            throw new UnauthorizedAccessException();

        if (request.Ids?.Count > 0)
            query = query.Where(n => request.Ids.Contains(n.Id));

        await query.Where(n => !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), cancellationToken);
    }
}
