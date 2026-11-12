namespace ParentTracker.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(Guid userId, string email, string role, Guid familyId);
    string GenerateChildAccessToken(Guid childId, Guid familyId);
    string GenerateRefreshToken();
    string HashToken(string token);
}
