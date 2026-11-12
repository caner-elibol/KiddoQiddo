using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Rewards.Commands;

public record CreateRewardCommand(string Title, string? Description, int RequiredPoints, List<Guid>? ChildIds) : IRequest<Guid>;

public class CreateRewardCommandHandler : IRequestHandler<CreateRewardCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateRewardCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateRewardCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.FamilyId == Guid.Empty) throw new UnauthorizedAccessException();

        var reward = new Reward
        {
            FamilyId = _currentUser.FamilyId,
            ParentId = _currentUser.UserId,
            Title = request.Title,
            Description = request.Description,
            RequiredPoints = request.RequiredPoints
        };

        _db.Rewards.Add(reward);
        await _db.SaveChangesAsync(cancellationToken);

        if (request.ChildIds is { Count: > 0 })
        {
            foreach (var childId in request.ChildIds.Distinct())
            {
                _db.RewardAssignments.Add(new RewardAssignment
                {
                    RewardId = reward.Id,
                    ChildId = childId,
                    IsActive = true
                });
            }
            await _db.SaveChangesAsync(cancellationToken);
        }

        return reward.Id;
    }
}

public record RequestRewardCommand(Guid RewardId) : IRequest<Guid>;

public class RequestRewardCommandHandler : IRequestHandler<RequestRewardCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public RequestRewardCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    public async Task<Guid> Handle(RequestRewardCommand request, CancellationToken cancellationToken)
    {
        var childId = _currentUser.ChildId ?? throw new UnauthorizedAccessException();

        var reward = await _db.Rewards.FindAsync([request.RewardId], cancellationToken)
            ?? throw new KeyNotFoundException("Odul bulunamadi.");

        var child = await _db.Children.FindAsync([childId], cancellationToken)
            ?? throw new KeyNotFoundException("Cocuk bulunamadi.");

        if (child.TotalPoints < reward.RequiredPoints)
            throw new InvalidOperationException("Yeterli puaniniz yok.");

        var rewardRequest = new RewardRequest
        {
            RewardId = request.RewardId,
            ChildId = childId,
            Status = RewardRequestStatus.Requested
        };

        _db.RewardRequests.Add(rewardRequest);
        await _db.SaveChangesAsync(cancellationToken);

        var parents = await _db.FamilyMembers
            .Where(fm => fm.FamilyId == child.FamilyId && fm.Role == UserRole.Parent)
            .ToListAsync(cancellationToken);

        foreach (var parent in parents)
        {
            await _notifications.NotifyParent(
                parent.UserId,
                child.FamilyId,
                "Odul Talep Edildi",
                $"'{child.Name}' '{reward.Title}' odulunu talep etti.",
                NotificationType.RewardRequested,
                cancellationToken);
        }

        return rewardRequest.Id;
    }
}

public record HandleRewardRequestCommand(Guid RequestId, bool Approved) : IRequest;

public class HandleRewardRequestCommandHandler : IRequestHandler<HandleRewardRequestCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IPointService _pointService;
    private readonly INotificationService _notifications;

    public HandleRewardRequestCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, IPointService pointService, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _pointService = pointService;
        _notifications = notifications;
    }

    public async Task Handle(HandleRewardRequestCommand request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var rr = await _db.RewardRequests
            .Include(r => r.Reward)
            .Include(r => r.Child)
            .FirstOrDefaultAsync(r => r.Id == request.RequestId && r.Child.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Odül talebi bulunamadi.");

        if (rr.Status != RewardRequestStatus.Requested)
            throw new InvalidOperationException("Bu talep zaten işlendi.");

        if (request.Approved)
        {
            rr.Status = RewardRequestStatus.Approved;
            rr.ApprovedAt = DateTimeOffset.UtcNow;
            rr.ApprovedByUserId = _currentUser.UserId;

            await _pointService.DeductPoints(
                rr.ChildId,
                rr.Reward.RequiredPoints,
                PointSourceType.Reward,
                rr.Id,
                $"Ödül kullanıldı: {rr.Reward.Title}",
                cancellationToken);

            await _notifications.NotifyChild(
                rr.ChildId,
                familyId,
                "Ödül Talebin Onaylandı 🎉",
                $"'{rr.Reward.Title}' ödülün onaylandı!",
                NotificationType.RewardApproved,
                cancellationToken);
        }
        else
        {
            rr.Status = RewardRequestStatus.Rejected;
            rr.RejectedAt = DateTimeOffset.UtcNow;
            rr.RejectedByUserId = _currentUser.UserId;

            await _notifications.NotifyChild(
                rr.ChildId,
                familyId,
                "Ödül Talebin Reddedildi",
                $"'{rr.Reward.Title}' ödül talebin reddedildi.",
                NotificationType.RewardRejected,
                cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}

public record DeliverRewardCommand(Guid RequestId) : IRequest;

public class DeliverRewardCommandHandler : IRequestHandler<DeliverRewardCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notifications;

    public DeliverRewardCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser, INotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    public async Task Handle(DeliverRewardCommand request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var rr = await _db.RewardRequests
            .Include(r => r.Reward)
            .Include(r => r.Child)
            .FirstOrDefaultAsync(r => r.Id == request.RequestId && r.Child.FamilyId == familyId, cancellationToken)
            ?? throw new KeyNotFoundException("Ödül talebi bulunamadı.");

        if (rr.Status != RewardRequestStatus.Approved)
            throw new InvalidOperationException("Yalnızca onaylanmış talepler teslim edilebilir.");

        rr.Status = RewardRequestStatus.Delivered;
        rr.DeliveredAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        await _notifications.NotifyChild(
            rr.ChildId,
            familyId,
            "Ödülün Teslim Edildi 🎁",
            $"'{rr.Reward.Title}' ödülün teslim edildi. Tebrikler!",
            NotificationType.System,
            cancellationToken);
    }
}

