using LearnAfricaLite.Api.Controllers;
using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Services;

/// <summary>
/// Evaluates a user's progress against every unearned BadgeDefinition and awards
/// (+ notifies) any that have just been met. Call after any action that could move
/// a badge requirement forward (lesson/quiz completion, course completion, a review,
/// or a profile update).
/// </summary>
public static class BadgeService
{
    public static async Task EvaluateAndAwardAsync(AppDbContext db, Guid userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return;

        var earnedDefinitionIds = await db.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.BadgeDefinitionId)
            .ToListAsync();

        var candidates = await db.BadgeDefinitions
            .Where(b => !earnedDefinitionIds.Contains(b.Id))
            .ToListAsync();
        if (candidates.Count == 0) return;

        var lessonsCompletedCount = await db.LessonProgresses.CountAsync(lp => lp.UserId == userId && lp.IsCompleted);
        var perfectQuizzesCount = await db.QuizAttempts.CountAsync(a => a.UserId == userId && a.Score == 100);
        var reviewsCount = await db.Reviews.CountAsync(r => r.UserId == userId);
        var enrolledCoursesCount = await db.Enrollments.CountAsync(e => e.UserId == userId);
        var forumContributionsCount = await db.ForumThreads.CountAsync(t => t.UserId == userId)
            + await db.ForumReplies.CountAsync(r => r.UserId == userId);

        var completedEnrollments = await db.Enrollments.AsNoTracking()
            .Where(e => e.UserId == userId && e.CompletedAt != null)
            .Select(e => new { e.EnrolledAt, e.CompletedAt })
            .ToListAsync();
        var coursesCompletedCount = completedEnrollments.Count;
        var fastFinishCount = completedEnrollments.Count(e => e.CompletedAt!.Value - e.EnrolledAt <= TimeSpan.FromDays(7));
        var isProfileComplete = !string.IsNullOrEmpty(user.Bio) && !string.IsNullOrEmpty(user.Avatar);

        int ProgressFor(string requirementType) => requirementType switch
        {
            "lessons_completed" => lessonsCompletedCount,
            "courses_completed" => coursesCompletedCount,
            "perfect_quizzes" => perfectQuizzesCount,
            "day_streak" => user.Streak,
            "reviews_submitted" => reviewsCount,
            "fast_finish" => fastFinishCount,
            "profile_completed" => isProfileComplete ? 1 : 0,
            "courses_enrolled" => enrolledCoursesCount,
            "forum_contributions" => forumContributionsCount,
            _ => 0,
        };

        foreach (var definition in candidates)
        {
            if (ProgressFor(definition.RequirementType) < definition.Goal) continue;

            db.UserBadges.Add(new UserBadge { UserId = userId, BadgeDefinitionId = definition.Id });
            await AuthController.NotifyAsync(db, userId, NotificationType.Achievement,
                $"Badge earned: {definition.Title}", definition.Description, $"badge_{definition.Key}_{userId}",
                "/dashboard");
        }

        await db.SaveChangesAsync();
    }
}
