using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/users/me")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
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
        if (request.TwoFactorAppEnabled is not null) user.TwoFactorAppEnabled = request.TwoFactorAppEnabled.Value;
        if (request.Appearance is not null) user.Appearance = request.Appearance;

        await db.SaveChangesAsync();

        var roles = await db.UserRoles.Where(r => r.UserId == user.Id)
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name!)
            .ToListAsync();

        return user.ToDto(roles);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsDto>> Stats()
    {
        var userId = User.GetUserId();
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return NotFound();

        var lessonsCompletedCount = await db.LessonProgresses.CountAsync(lp => lp.UserId == userId && lp.IsCompleted);
        var perfectQuizzesCount = await db.LessonProgresses.CountAsync(lp => lp.UserId == userId && lp.QuizScore == 100);
        var enrolledCoursesCount = await db.Enrollments.CountAsync(e => e.UserId == userId);
        var reviewsCount = await db.Reviews.CountAsync(r => r.UserId == userId);

        var completedEnrollments = await db.Enrollments.AsNoTracking()
            .Where(e => e.UserId == userId && e.CompletedAt != null)
            .Select(e => new { e.EnrolledAt, e.CompletedAt })
            .ToListAsync();

        var coursesCompletedCount = completedEnrollments.Count;
        var fastFinishCount = completedEnrollments.Count(e => e.CompletedAt!.Value - e.EnrolledAt <= TimeSpan.FromDays(7));
        var isProfileComplete = !string.IsNullOrEmpty(user.Bio) && !string.IsNullOrEmpty(user.Avatar);

        return new UserStatsDto(
            lessonsCompletedCount, coursesCompletedCount, enrolledCoursesCount,
            perfectQuizzesCount, fastFinishCount, reviewsCount, isProfileComplete
        );
    }
}
