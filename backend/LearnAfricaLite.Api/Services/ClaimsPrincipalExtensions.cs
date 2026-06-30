using System.Security.Claims;

namespace LearnAfricaLite.Api.Services;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var raw = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal.FindFirstValue("sub")
                  ?? throw new InvalidOperationException("No user id claim present.");
        return Guid.Parse(raw);
    }
}
