using LearnAfricaLite.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Data;

/// <summary>
/// Seeds roles, one bootstrap SuperAdmin account, and static badge definitions.
/// Deliberately does NOT seed any courses, instructors, or reviews — that content
/// is created live through the app once it's running.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration config, ILogger logger)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<AppDbContext>();

        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }

        var superAdminEmail = config["SeedSuperAdmin:Email"] ?? "admin@learnafrica.local";
        var superAdminPassword = config["SeedSuperAdmin:Password"] ?? "ChangeMe!2026";

        if (await userManager.FindByEmailAsync(superAdminEmail) is null)
        {
            var superAdmin = new ApplicationUser
            {
                UserName = superAdminEmail,
                Email = superAdminEmail,
                Name = "Super Admin",
                EmailConfirmed = true,
                JoinedDate = DateTime.UtcNow,
                // Not an instructor — Admin/SuperAdmin bypass the approval gate by role,
                // so this stays None to keep them out of the instructor-approvals list.
                InstructorApprovalStatus = InstructorApprovalStatus.None,
            };

            var result = await userManager.CreateAsync(superAdmin, superAdminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(superAdmin, Roles.SuperAdmin);
                logger.LogWarning(
                    "Seeded bootstrap SuperAdmin account: {Email} / {Password} — change this password immediately after first login.",
                    superAdminEmail, superAdminPassword);
            }
            else
            {
                logger.LogError("Failed to seed SuperAdmin: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        var allBadgeDefinitions = new[]
        {
            new BadgeDefinition { Key = "FIRST_STEPS", Title = "First Steps", Description = "Unlocked by completing your very first lesson.", IconName = "Target", RequirementType = "lessons_completed", Goal = 1, Color = "orange" },
            new BadgeDefinition { Key = "COURSE_CHAMPION", Title = "Course Champion", Description = "Awarded for successfully finishing an entire course.", IconName = "Trophy", RequirementType = "courses_completed", Goal = 1, Color = "yellow" },
            new BadgeDefinition { Key = "QUIZ_MASTER", Title = "Quiz Master", Description = "Achieve a perfect 100% score on 5 different quizzes.", IconName = "Brain", RequirementType = "perfect_quizzes", Goal = 5, Color = "purple" },
            new BadgeDefinition { Key = "CONSISTENT_LEARNER", Title = "Consistent Learner", Description = "Maintain a learning streak for 7 consecutive days.", IconName = "Flame", RequirementType = "day_streak", Goal = 7, Color = "red" },
            new BadgeDefinition { Key = "SOCIAL_BUTTERFLY", Title = "Social Butterfly", Description = "Contribute to the community by leaving 10 course reviews.", IconName = "MessageSquare", RequirementType = "reviews_submitted", Goal = 10, Color = "blue" },
            new BadgeDefinition { Key = "SPEED_LEARNER", Title = "Speed Learner", Description = "Finish any full course within 7 days of enrollment.", IconName = "Zap", RequirementType = "fast_finish", Goal = 1, Color = "amber" },
            new BadgeDefinition { Key = "PATHFINDER", Title = "Pathfinder", Description = "Complete your profile and set your learning goals.", IconName = "Compass", RequirementType = "profile_completed", Goal = 1, Color = "emerald" },
            new BadgeDefinition { Key = "DEDICATED_LEARNER", Title = "Dedicated Learner", Description = "Complete 25 lessons across your courses.", IconName = "BookOpenCheck", RequirementType = "lessons_completed", Goal = 25, Color = "teal" },
            new BadgeDefinition { Key = "PERFECTIONIST", Title = "Perfectionist", Description = "Score a perfect 100% on 10 different quizzes.", IconName = "Award", RequirementType = "perfect_quizzes", Goal = 10, Color = "violet" },
            new BadgeDefinition { Key = "BOOKWORM", Title = "Bookworm", Description = "Enroll in 5 or more courses.", IconName = "Library", RequirementType = "courses_enrolled", Goal = 5, Color = "cyan" },
            new BadgeDefinition { Key = "SCHOLAR", Title = "Scholar", Description = "Complete 3 full courses.", IconName = "GraduationCap", RequirementType = "courses_completed", Goal = 3, Color = "indigo" },
            new BadgeDefinition { Key = "DISCUSSION_STARTER", Title = "Discussion Starter", Description = "Contribute 5 posts or replies to course discussions.", IconName = "MessagesSquare", RequirementType = "forum_contributions", Goal = 5, Color = "pink" },
        };

        var existingBadgeKeys = await db.BadgeDefinitions.Select(b => b.Key).ToListAsync();
        var missingBadges = allBadgeDefinitions.Where(b => !existingBadgeKeys.Contains(b.Key)).ToList();
        if (missingBadges.Count > 0)
        {
            db.BadgeDefinitions.AddRange(missingBadges);
            await db.SaveChangesAsync();
        }
    }
}
