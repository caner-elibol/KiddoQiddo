using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Rewards.Queries;

public record GetRewardsQuery : IRequest<List<RewardDto>>;

public record RewardDto(Guid Id, string Title, string? Description, int RequiredPoints, bool IsActive, List<Guid> AssignedChildIds);

public class GetRewardsQueryHandler : IRequestHandler<GetRewardsQuery, List<RewardDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetRewardsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<RewardDto>> Handle(GetRewardsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.ChildId.HasValue)
        {
            // Child: see only rewards assigned to them (or family-wide rewards with no assignments)
            var childId = _currentUser.ChildId.Value;
            var child = await _db.Children.FindAsync([childId], cancellationToken)
                ?? throw new UnauthorizedAccessException();

            var allRewards = await _db.Rewards
                .Include(r => r.Assignments)
                .Where(r => r.FamilyId == child.FamilyId && r.IsActive)
                .ToListAsync(cancellationToken);

            return allRewards
                .Where(r => !r.Assignments.Any(a => a.IsActive) || r.Assignments.Any(a => a.ChildId == childId && a.IsActive))
                .OrderBy(r => r.RequiredPoints)
                .Select(r => new RewardDto(r.Id, r.Title, r.Description, r.RequiredPoints, r.IsActive,
                    r.Assignments.Where(a => a.IsActive).Select(a => a.ChildId).ToList()))
                .ToList();
        }

        if (_currentUser.FamilyId != Guid.Empty)
        {
            // Parent: see all rewards with assignment info
            return await _db.Rewards
                .Include(r => r.Assignments)
                .Where(r => r.FamilyId == _currentUser.FamilyId)
                .OrderBy(r => r.RequiredPoints)
                .Select(r => new RewardDto(r.Id, r.Title, r.Description, r.RequiredPoints, r.IsActive,
                    r.Assignments.Where(a => a.IsActive).Select(a => a.ChildId).ToList()))
                .ToListAsync(cancellationToken);
        }

        throw new UnauthorizedAccessException();
    }
}

public record GetRewardRequestsQuery(RewardRequestStatus? Status) : IRequest<List<RewardRequestDto>>;

public record RewardRequestDto(
    Guid Id,
    Guid ChildId,
    string ChildName,
    string RewardTitle,
    int RequiredPoints,
    RewardRequestStatus Status,
    DateTimeOffset RequestedAt);

public class GetRewardRequestsQueryHandler : IRequestHandler<GetRewardRequestsQuery, List<RewardRequestDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetRewardRequestsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<RewardRequestDto>> Handle(GetRewardRequestsQuery request, CancellationToken cancellationToken)
    {
        var familyId = _currentUser.FamilyId;
        if (familyId == Guid.Empty) throw new UnauthorizedAccessException();

        var query = _db.RewardRequests
            .Include(rr => rr.Child)
            .Include(rr => rr.Reward)
            .Where(rr => rr.Child.FamilyId == familyId);

        if (request.Status.HasValue)
            query = query.Where(rr => rr.Status == request.Status.Value);

        return await query
            .OrderByDescending(rr => rr.RequestedAt)
            .Select(rr => new RewardRequestDto(
                rr.Id, rr.ChildId, rr.Child.Name,
                rr.Reward.Title, rr.Reward.RequiredPoints,
                rr.Status, rr.RequestedAt))
            .ToListAsync(cancellationToken);
    }
}

public record GetChildRewardRequestsQuery : IRequest<List<ChildRewardRequestDto>>;

public record ChildRewardRequestDto(
    Guid Id,
    Guid RewardId,
    string RewardTitle,
    int RequiredPoints,
    string Status,
    DateTimeOffset RequestedAt);

public class GetChildRewardRequestsQueryHandler : IRequestHandler<GetChildRewardRequestsQuery, List<ChildRewardRequestDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetChildRewardRequestsQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<ChildRewardRequestDto>> Handle(GetChildRewardRequestsQuery request, CancellationToken cancellationToken)
    {
        var childId = _currentUser.ChildId ?? throw new UnauthorizedAccessException();

        return await _db.RewardRequests
            .Include(rr => rr.Reward)
            .Where(rr => rr.ChildId == childId)
            .OrderByDescending(rr => rr.RequestedAt)
            .Select(rr => new ChildRewardRequestDto(
                rr.Id,
                rr.RewardId,
                rr.Reward.Title,
                rr.Reward.RequiredPoints,
                rr.Status.ToString(),
                rr.RequestedAt))
            .ToListAsync(cancellationToken);
    }
}
