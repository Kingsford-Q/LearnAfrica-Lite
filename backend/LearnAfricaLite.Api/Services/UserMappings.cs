using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;

namespace LearnAfricaLite.Api.Services;

public static class UserMappings
{
    private static readonly string[] RolePriority = [Roles.SuperAdmin, Roles.Admin, Roles.Instructor, Roles.Student];

    public static string PrimaryRole(this IList<string> roles)
    {
        foreach (var candidate in RolePriority)
        {
            if (roles.Contains(candidate)) return candidate;
        }
        return Roles.Student;
    }

    public static UserDto ToDto(this ApplicationUser user, IList<string> roles) => new(
        user.Id,
        user.Name,
        user.Email ?? string.Empty,
        roles.PrimaryRole(),
        user.Avatar,
        user.JoinedDate,
        user.Bio,
        user.Location,
        user.Website,
        user.InstructorApprovalStatus.ToString(),
        user.Streak,
        user.NotificationsEmail,
        user.NotificationsPush,
        user.NotificationsUpdates,
        user.TwoFactorAppEnabled,
        user.Appearance,
        user.InstructorPayoutAlerts,
        user.InstructorMessagesEnabled
    );
}
