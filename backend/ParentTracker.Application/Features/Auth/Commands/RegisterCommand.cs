using MediatR;
using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Features.Auth.Commands;

public record RegisterCommand(
    string Email,
    string Password,
    string FullName) : IRequest<RegisterResult>;

public record RegisterResult(string AccessToken, string RefreshToken, Guid UserId, string FullName, Guid FamilyId);

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResult>
{
    private readonly IApplicationDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterCommandHandler(IApplicationDbContext db, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken))
            throw new InvalidOperationException("Bu e-posta adresi zaten kullanılıyor.");

        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName,
            Role = UserRole.Parent
        };

        _db.Users.Add(user);

        var familyCode = GenerateFamilyCode();
        var family = new Family
        {
            Name = $"{request.FullName}'in Ailesi",
            FamilyCode = familyCode,
            OwnerParentId = user.Id
        };
        _db.Families.Add(family);

        var member = new FamilyMember
        {
            UserId = user.Id,
            FamilyId = family.Id,
            Role = UserRole.Parent
        };
        _db.FamilyMembers.Add(member);

        await _db.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Email!, user.Role.ToString(), family.Id);
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashToken(refreshTokenValue),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(30)
        };
        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new RegisterResult(accessToken, refreshTokenValue, user.Id, user.FullName, family.Id);
    }

    private static string GenerateFamilyCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 8).Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
