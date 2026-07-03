using LearnAfricaLite.Api.Models;

namespace LearnAfricaLite.Api.Services;

/// <summary>
/// Tracks the CONSISTENT_LEARNER badge's day-streak requirement. Call once per
/// qualifying learning activity (lesson completion, quiz submission) — repeat
/// calls on the same UTC calendar day are no-ops, a gap of a day or more resets
/// the streak to 1, and consecutive-day activity increments it.
/// </summary>
public static class StreakService
{
    public static void RecordActivity(ApplicationUser user)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (user.LastActivityDate == today) return; // already logged today

        user.Streak = user.LastActivityDate == today.AddDays(-1) ? user.Streak + 1 : 1;
        user.LastActivityDate = today;
    }
}
