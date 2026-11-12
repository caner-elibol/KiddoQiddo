using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Application.Common.Constants;

namespace ParentTracker.Application.Features.Auth.Commands;

public record ChildLoginCommand(string FamilyCode, string Pin) : IRequest<ChildLoginResult>;

public record ChildLoginResult(string AccessToken, Guid ChildId, string ChildName, Guid FamilyId, int TotalPoints, int Level);

public class ChildLoginCommandHandler : IRequestHandler<ChildLoginCommand, ChildLoginResult>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public ChildLoginCommandHandler(IApplicationDbContext db, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<ChildLoginResult> Handle(ChildLoginCommand request, CancellationToken cancellationToken)
    {
        var family = await _db.Families
            .FirstOrDefaultAsync(f => f.FamilyCode == request.FamilyCode.ToUpperInvariant(), cancellationToken)
            ?? throw new UnauthorizedAccessException("Aile kodu hatalı.");

        var children = await _db.Children
            .Where(c => c.FamilyId == family.Id && c.IsActive)
            .ToListAsync(cancellationToken);

        Domain.Entities.Child? matchedChild = null;
        foreach (var child in children)
        {
            if (!string.IsNullOrEmpty(child.PinCodeHash) && _passwordHasher.Verify(request.Pin, child.PinCodeHash))
            {
                matchedChild = child;
                break;
            }
        }

        if (matchedChild is null)
            throw new UnauthorizedAccessException("PIN hatalı veya çocuk bulunamadı.");

        var accessToken = _jwtTokenService.GenerateChildAccessToken(matchedChild.Id, matchedChild.FamilyId);
        var level = LevelThresholds.CalculateLevel(matchedChild.TotalLifetimePoints);

        return new ChildLoginResult(accessToken, matchedChild.Id, matchedChild.Name, matchedChild.FamilyId, matchedChild.TotalPoints, level);
    }
}
