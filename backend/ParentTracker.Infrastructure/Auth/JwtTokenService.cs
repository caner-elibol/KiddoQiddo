using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(Guid userId, string email, string role, Guid familyId)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Role, role),
            new("familyId", familyId.ToString()),
        };

        return CreateToken(claims, GetAccessTokenExpiry());
    }

    public string GenerateChildAccessToken(Guid childId, Guid familyId)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, childId.ToString()),
            new("childId", childId.ToString()),
            new(ClaimTypes.Role, "Child"),
            new("familyId", familyId.ToString()),
        };

        return CreateToken(claims, GetChildTokenExpiry());
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
    }

    public string HashToken(string token)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private string CreateToken(IEnumerable<Claim> claims, DateTime expiry)
    {
        var key = GetSigningKey();
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private SymmetricSecurityKey GetSigningKey()
    {
        var secret = _configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT secret is not configured.");
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    private DateTime GetAccessTokenExpiry()
    {
        var minutes = _configuration.GetValue("Jwt:AccessTokenExpiryMinutes", 60);
        return DateTime.UtcNow.AddMinutes(minutes);
    }

    private static DateTime GetChildTokenExpiry()
    {
        return DateTime.UtcNow.Date.AddDays(1).AddSeconds(-1);
    }
}
