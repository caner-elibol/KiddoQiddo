using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Application.Features.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResult>;

public record RefreshTokenResult(string AccessToken, string RefreshToken);

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResult>
{
    private readonly IApplicationDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;

    public RefreshTokenCommandHandler(IApplicationDbContext db, IJwtTokenService jwtTokenService)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<RefreshTokenResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = _jwtTokenService.HashToken(request.RefreshToken);

        var stored = await _db.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u!.FamilyMemberships)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.UserId != null, cancellationToken)
            ?? throw new UnauthorizedAccessException("Geçersiz refresh token.");

        if (stored.RevokedAt.HasValue || stored.ExpiresAt < DateTimeOffset.UtcNow)
            throw new UnauthorizedAccessException("Refresh token süresi dolmuş veya iptal edilmiş.");

        stored.RevokedAt = DateTimeOffset.UtcNow;

        var familyId = stored.User!.FamilyMemberships.FirstOrDefault()?.FamilyId ?? Guid.Empty;
        var newAccessToken = _jwtTokenService.GenerateAccessToken(stored.User.Id, stored.User.Email!, stored.User.Role.ToString(), familyId);
        var newRefreshValue = _jwtTokenService.GenerateRefreshToken();

        var newRefreshToken = new RefreshToken
        {
            UserId = stored.UserId,
            TokenHash = _jwtTokenService.HashToken(newRefreshValue),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(30)
        };
        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResult(newAccessToken, newRefreshValue);
    }
}
