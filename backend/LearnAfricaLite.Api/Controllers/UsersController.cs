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
[Route("api/users/me")]
[Authorize]
public class UsersController(AppDbContext db, UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileRequest request)
    {
        var user = await db.Users.FindAsync(User.GetUserId());
        if (user is null) return NotFound();

        if (request.Name is not null) user.Name = request.Name;
        if (request.Bio is not null) user.Bio = request.Bio;
        if (request.Location is not null) user.Location = request.Location;
        if (request.Website is not null) user.Website = request.Website;
        if (request.Avatar is not null) user.Avatar = request.Avatar;

        await db.SaveChangesAsync();
        await BadgeService.EvaluateAndAwardAsync(db, user.Id);

        var roles = await db.UserRoles.Where(r => r.UserId == user.Id)
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name!)
            .ToListAsync();

        return user.ToDto(roles);
    }

    [HttpPut("settings")]
    public async Task<ActionResult<UserDto>> UpdateSettings(UpdateSettingsRequest request)
    {
        var user = await db.Users.FindAsync(User.GetUserId());
        if (user is null) return NotFound();

        if (request.NotificationsEmail is not null) user.NotificationsEmail = request.NotificationsEmail.Value;
        if (request.NotificationsPush is not null) user.NotificationsPush = request.NotificationsPush.Value;
        if (request.NotificationsUpdates is not null) user.NotificationsUpdates = request.NotificationsUpdates.Value;
        if (request.Appearance is not null) user.Appearance = request.Appearance;
        if (request.InstructorPayoutAlerts is not null) user.InstructorPayoutAlerts = request.InstructorPayoutAlerts.Value;
        if (request.InstructorMessagesEnabled is not null) user.InstructorMessagesEnabled = request.InstructorMessagesEnabled.Value;

        await db.SaveChangesAsync();

        var roles = await db.UserRoles.Where(r => r.UserId == user.Id)
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name!)
            .ToListAsync();

        return user.ToDto(roles);
    }

    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await userManager.FindByIdAsync(User.GetUserId().ToString());
        if (user is null) return NotFound();

        var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        return Ok(new { message = "Password updated successfully." });
    }

    [HttpPost("2fa/setup")]
    public async Task<ActionResult<TwoFactorSetupDto>> SetupTwoFactor()
    {
        var user = await userManager.FindByIdAsync(User.GetUserId().ToString());
        if (user is null) return NotFound();

        // Generates (or regenerates, if setup is retried) a pending secret.
        // TwoFactorAppEnabled stays false until Verify confirms the user's
        // authenticator app actually has it — otherwise a dropped setup flow
        // could brick the account with no way to produce a valid code.
        var secret = TotpService.GenerateSecret();
        user.TwoFactorSecret = secret;
        await userManager.UpdateAsync(user);

        return new TwoFactorSetupDto(secret, TotpService.BuildOtpAuthUri(secret, user.Email ?? user.Name));
    }

    [HttpPost("2fa/verify")]
    public async Task<IActionResult> VerifyTwoFactor(VerifyTwoFactorSetupRequest request)
    {
        var user = await userManager.FindByIdAsync(User.GetUserId().ToString());
        if (user is null) return NotFound();
        if (string.IsNullOrEmpty(user.TwoFactorSecret))
            return BadRequest(new { message = "Start setup before verifying a code." });

        if (!TotpService.ValidateCode(user.TwoFactorSecret, request.Code))
            return BadRequest(new { message = "Invalid code. Please try again." });

        user.TwoFactorAppEnabled = true;
        await userManager.UpdateAsync(user);
        return Ok(new { message = "Two-factor authentication is now enabled." });
    }

    [HttpPost("2fa/disable")]
    public async Task<IActionResult> DisableTwoFactor(VerifyTwoFactorSetupRequest request)
    {
        var user = await userManager.FindByIdAsync(User.GetUserId().ToString());
        if (user is null) return NotFound();
        if (!user.TwoFactorAppEnabled || string.IsNullOrEmpty(user.TwoFactorSecret))
            return BadRequest(new { message = "Two-factor authentication is not enabled." });

        if (!TotpService.ValidateCode(user.TwoFactorSecret, request.Code))
            return BadRequest(new { message = "Invalid code." });

        user.TwoFactorAppEnabled = false;
        user.TwoFactorSecret = null;
        await userManager.UpdateAsync(user);
        return Ok(new { message = "Two-factor authentication has been disabled." });
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var userId = User.GetUserId();
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return NotFound();

        var hasCourses = await db.Courses.AnyAsync(c => c.InstructorId == userId);
        if (hasCourses)
        {
            return BadRequest(new
            {
                message = "You still have published courses. Delete or transfer them before deleting your account."
            });
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        return NoContent();
    }

    [HttpGet("badges")]
    public async Task<ActionResult<List<UserBadgeDto>>> Badges()
    {
        var userId = User.GetUserId();
        var badges = await db.UserBadges.AsNoTracking()
            .Where(ub => ub.UserId == userId)
            .Include(ub => ub.BadgeDefinition)
            .Select(ub => new UserBadgeDto(ub.BadgeDefinition!.Key, ub.EarnedAt))
            .ToListAsync();

        return badges;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsDto>> Stats()
    {
        var userId = User.GetUserId();
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return NotFound();

        var lessonsCompletedCount = await db.LessonProgresses.CountAsync(lp => lp.UserId == userId && lp.IsCompleted);
        var perfectQuizzesCount = await db.QuizAttempts.CountAsync(a => a.UserId == userId && a.Score == 100);
        var enrolledCoursesCount = await db.Enrollments.CountAsync(e => e.UserId == userId);
        var reviewsCount = await db.Reviews.CountAsync(r => r.UserId == userId);
        var forumContributionsCount = await db.ForumThreads.CountAsync(t => t.UserId == userId)
            + await db.ForumReplies.CountAsync(r => r.UserId == userId);

        var completedEnrollments = await db.Enrollments.AsNoTracking()
            .Where(e => e.UserId == userId && e.CompletedAt != null)
            .Select(e => new { e.EnrolledAt, e.CompletedAt })
            .ToListAsync();

        var coursesCompletedCount = completedEnrollments.Count;
        var fastFinishCount = completedEnrollments.Count(e => e.CompletedAt!.Value - e.EnrolledAt <= TimeSpan.FromDays(7));
        var isProfileComplete = !string.IsNullOrEmpty(user.Bio) && !string.IsNullOrEmpty(user.Avatar);

        return new UserStatsDto(
            lessonsCompletedCount, coursesCompletedCount, enrolledCoursesCount,
            perfectQuizzesCount, fastFinishCount, reviewsCount, isProfileComplete,
            forumContributionsCount
        );
    }
}
