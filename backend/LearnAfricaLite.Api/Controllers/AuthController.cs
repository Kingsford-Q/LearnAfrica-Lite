using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    AppDbContext db,
    IHostEnvironment env,
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<AuthController> logger) : ControllerBase
{
    private const string RefreshCookieName = "refreshToken";

    // Browsers silently drop `Secure` cookies over plain HTTP, which is how the
    // backend runs locally (dotnet run, no TLS) — so the refresh cookie (and thus
    // "stay logged in") would never actually be set during local development if
    // this were hardcoded to Secure/SameSite=None like production needs for its
    // cross-origin (Vercel + Render) deployment. `SameSite=None` also requires
    // `Secure` to be set per the cookie spec, so the two must flip together.
    private CookieOptions RefreshCookieOptions(DateTime? expires = null) => new()
    {
        HttpOnly = true,
        Secure = !env.IsDevelopment(),
        SameSite = env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
        Expires = expires,
        Path = "/api/auth",
    };

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            return Conflict(new { message = "An account with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name,
            JoinedDate = DateTime.UtcNow,
        };

        if (request.IsInstructor)
        {
            user.InstructorApprovalStatus = InstructorApprovalStatus.Pending;
            user.InstructorTitle = request.InstructorTitle;
            user.InstructorPortfolio = request.InstructorPortfolio;
            user.InstructorSkills = request.InstructorSkills ?? [];
            user.InstructorAppliedAt = DateTime.UtcNow;
        }

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        // Everyone starts as Student in terms of route access; instructor capabilities
        // only unlock once InstructorApprovalStatus == Approved (see InstructorsController).
        await userManager.AddToRoleAsync(user, Roles.Student);
        if (request.IsInstructor)
        {
            await userManager.AddToRoleAsync(user, Roles.Instructor);

            await NotifyAsync(db, user.Id, NotificationType.System, "Instructor application submitted",
                "Your instructor application is pending review by our team.", $"instructor_applied_{user.Id}");
        }

        logger.LogInformation("New user registered: {Email}", user.Email);

        return await IssueTokensAsync(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        if (user.TwoFactorAppEnabled)
        {
            var pendingToken = tokenService.GenerateTwoFactorPendingToken(user.Id);
            return Ok(new { requiresTwoFactor = true, twoFactorToken = pendingToken });
        }

        return await IssueTokensAsync(user);
    }

    [HttpPost("login/2fa")]
    public async Task<ActionResult<AuthResponse>> LoginTwoFactor(VerifyTwoFactorLoginRequest request)
    {
        var userId = tokenService.ValidateTwoFactorPendingToken(request.TwoFactorToken);
        if (userId is null)
            return Unauthorized(new { message = "Your sign-in session expired. Please log in again." });

        var user = await userManager.FindByIdAsync(userId.Value.ToString());
        if (user is null || !user.TwoFactorAppEnabled || string.IsNullOrEmpty(user.TwoFactorSecret))
            return Unauthorized(new { message = "Two-factor authentication is not enabled for this account." });

        if (!TotpService.ValidateCode(user.TwoFactorSecret, request.Code))
            return Unauthorized(new { message = "Invalid authentication code." });

        return await IssueTokensAsync(user);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        // Always respond the same way whether or not the account exists, so this
        // endpoint can't be used to enumerate registered emails.
        if (user is not null)
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(token);
            var encodedEmail = Uri.EscapeDataString(request.Email);
            var frontendOrigin = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?.FirstOrDefault()
                ?? "http://localhost:5173";
            var resetLink = $"{frontendOrigin}/reset-password?email={encodedEmail}&token={encodedToken}";

            await emailService.SendAsync(
                request.Email,
                "Reset your LearnAfrica Lite password",
                $"<p>Click the link below to reset your password. This link expires soon and can only be used once.</p><p><a href=\"{resetLink}\">{resetLink}</a></p>");
        }

        return Ok(new { message = "If an account with that email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return BadRequest(new { message = "Invalid or expired reset link." });

        var result = await userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        return Ok(new { message = "Password reset successfully." });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        if (!Request.Cookies.TryGetValue(RefreshCookieName, out var rawToken) || string.IsNullOrEmpty(rawToken))
            return Unauthorized(new { message = "Missing refresh token." });

        var hash = tokenService.HashToken(rawToken);
        var stored = await db.RefreshTokens.Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == hash);

        if (stored is null || !stored.IsActive || stored.User is null)
        {
            Response.Cookies.Delete(RefreshCookieName, RefreshCookieOptions());
            return Unauthorized(new { message = "Invalid or expired refresh token." });
        }

        stored.RevokedAt = DateTime.UtcNow;
        var response = await IssueTokensAsync(stored.User);

        var newHash = tokenService.HashToken(Request.Cookies[RefreshCookieName] ?? string.Empty);
        stored.ReplacedByTokenHash = newHash;
        await db.SaveChangesAsync();

        return response;
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue(RefreshCookieName, out var rawToken) && !string.IsNullOrEmpty(rawToken))
        {
            var hash = tokenService.HashToken(rawToken);
            var stored = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash);
            if (stored is not null)
            {
                stored.RevokedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }
        }

        Response.Cookies.Delete(RefreshCookieName, RefreshCookieOptions());
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = User.GetUserId();
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return NotFound();

        var roles = await userManager.GetRolesAsync(user);
        return user.ToDto(roles);
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var (accessToken, expiresAt) = tokenService.GenerateAccessToken(user, roles);
        var (rawRefresh, refreshHash, refreshExpiresAt) = tokenService.GenerateRefreshToken();

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshHash,
            ExpiresAt = refreshExpiresAt,
        });
        await db.SaveChangesAsync();

        Response.Cookies.Append(RefreshCookieName, rawRefresh, RefreshCookieOptions(refreshExpiresAt));

        return new AuthResponse(accessToken, expiresAt, user.ToDto(roles));
    }

    internal static async Task NotifyAsync(AppDbContext db, Guid userId, NotificationType type, string title, string message, string? dedupeKey = null, string? actionUrl = null)
    {
        if (dedupeKey is not null && await db.Notifications.AnyAsync(n => n.DedupeKey == dedupeKey))
            return;

        db.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            DedupeKey = dedupeKey,
            ActionUrl = actionUrl,
        });
        await db.SaveChangesAsync();
    }
}
