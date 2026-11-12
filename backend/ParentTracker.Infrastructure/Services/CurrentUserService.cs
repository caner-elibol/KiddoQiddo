using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ParentTracker.Application.Common.Interfaces;

namespace ParentTracker.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? _httpContextAccessor.HttpContext?.User.FindFirstValue("sub");
            return value is null ? Guid.Empty : Guid.Parse(value);
        }
    }

    public Guid? ChildId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue("childId");
            return value is null ? null : Guid.Parse(value);
        }
    }

    public Guid FamilyId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue("familyId");
            return value is null || value == string.Empty ? Guid.Empty : Guid.Parse(value);
        }
    }

    public string Role =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    public bool IsParent => Role == "Parent";
    public bool IsChild => Role == "Child";

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
