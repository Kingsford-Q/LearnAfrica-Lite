using System.ComponentModel.DataAnnotations;

namespace LearnAfricaLite.Api.DTOs;

public record RegisterRequest(
    [Required] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    bool IsInstructor = false,
    string? InstructorTitle = null,
    string? InstructorPortfolio = null,
    string[]? InstructorSkills = null
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record UserDto(
    Guid Id,
    string Name,
    string Email,
    string Role,
    string? Avatar,
    DateTime JoinedDate,
    string? Bio,
    string? Location,
    string? Website,
    string InstructorApprovalStatus,
    int Streak,
    bool NotificationsEmail,
    bool NotificationsPush,
    bool NotificationsUpdates,
    bool TwoFactorAppEnabled,
    string Appearance
);

public record AuthResponse(string AccessToken, DateTime ExpiresAt, UserDto User);

public record UpdateProfileRequest(
    string? Name,
    string? Bio,
    string? Location,
    string? Website,
    string? Avatar
);

public record UpdateSettingsRequest(
    bool? NotificationsEmail,
    bool? NotificationsPush,
    bool? NotificationsUpdates,
    bool? TwoFactorAppEnabled,
    string? Appearance
);

public record UserStatsDto(
    int LessonsCompletedCount,
    int CoursesCompletedCount,
    int EnrolledCoursesCount,
    int PerfectQuizzesCount,
    int FastFinishCount,
    int ReviewsCount,
    bool IsProfileComplete
);
