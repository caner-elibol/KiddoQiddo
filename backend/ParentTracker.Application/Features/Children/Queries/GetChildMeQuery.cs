using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Constants;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Children.Queries;

public record GetChildMeQuery : IRequest<ChildMeDto>;

public record ChildMeDto(
    Guid Id,
    string Name,
    string AvatarKey,
    int TotalPoints,
    int TotalLifetimePoints,
    int Level,
    double LevelProgressPercent,
    int PointsForNextLevel);

public class GetChildMeQueryHandler : IRequestHandler<GetChildMeQuery, ChildMeDto>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetChildMeQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ChildMeDto> Handle(GetChildMeQuery request, CancellationToken cancellationToken)
    {
        var childId = _currentUser.ChildId ?? throw new UnauthorizedAccessException();

        var child = await _db.Children.FindAsync([childId], cancellationToken)
            ?? throw new KeyNotFoundException("Çocuk bulunamadı.");

        var level = LevelThresholds.CalculateLevel(child.TotalLifetimePoints);
        var progress = LevelThresholds.LevelProgressPercent(child.TotalLifetimePoints, level);
        var nextLevelPoints = LevelThresholds.PointsForNextLevel(level);

        return new ChildMeDto(
            child.Id,
            child.Name,
            child.AvatarKey,
            child.TotalPoints,
            child.TotalLifetimePoints,
            level,
            progress,
            nextLevelPoints == int.MaxValue ? 0 : nextLevelPoints);
    }
}
