using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Constants;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Application.Features.Children.Queries;

public record GetChildrenQuery : IRequest<List<ChildDto>>;

public record ChildDto(
    Guid Id,
    string Name,
    int? BirthYear,
    string AvatarKey,
    int TotalPoints,
    int TotalLifetimePoints,
    int Level,
    bool IsActive);

public class GetChildrenQueryHandler : IRequestHandler<GetChildrenQuery, List<ChildDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetChildrenQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<ChildDto>> Handle(GetChildrenQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.FamilyId == Guid.Empty) throw new UnauthorizedAccessException();

        return await _db.Children
            .Where(c => c.FamilyId == _currentUser.FamilyId)
            .OrderBy(c => c.Name)
            .Select(c => new ChildDto(
                c.Id,
                c.Name,
                c.BirthYear,
                c.AvatarKey,
                c.TotalPoints,
                c.TotalLifetimePoints,
                LevelThresholds.CalculateLevel(c.TotalLifetimePoints),
                c.IsActive))
            .ToListAsync(cancellationToken);
    }
}
