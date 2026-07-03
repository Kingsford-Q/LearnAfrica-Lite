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

public record ForgotPasswordRequest(
    [Required, EmailAddress] string Email
);

public record ResetPasswordRequest(
    [Required, EmailAddress] string Email,
    [Required] string Token,
    [Required, MinLength(8)] string NewPassword
);

public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(8)] string NewPassword
);

public record TwoFactorSetupDto(string Secret, string OtpAuthUri);
public record VerifyTwoFactorSetupRequest([Required] string Code);
public record VerifyTwoFactorLoginRequest([Required] string TwoFactorToken, [Required] string Code);

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
    string Appearance,
    bool InstructorPayoutAlerts,
    bool InstructorMessagesEnabled,
    bool EmailConfirmed
);

public record AuthResponse(string AccessToken, DateTime ExpiresAt, UserDto User);

public record VerifyEmailRequest(
    [Required, EmailAddress] string Email,
    [Required] string Token
);

public record ResendVerificationRequest(
    [Required, EmailAddress] string Email
);

public record UpdateProfileRequest(
    string? Name,
    string? Bio,
    string? Location,
    string? Website,
    string? Avatar
);

// Two-factor is deliberately not settable here — it can only be turned on via
// the setup+verify flow (which proves the user actually holds the secret) or
// off via the disable flow (which requires a valid code), never by a blind toggle.
public record UpdateSettingsRequest(
    bool? NotificationsEmail,
    bool? NotificationsPush,
    bool? NotificationsUpdates,
    string? Appearance,
    bool? InstructorPayoutAlerts,
    bool? InstructorMessagesEnabled
);

public record UserStatsDto(
    int LessonsCompletedCount,
    int CoursesCompletedCount,
    int EnrolledCoursesCount,
    int PerfectQuizzesCount,
    int FastFinishCount,
    int ReviewsCount,
    bool IsProfileComplete,
    int ForumContributionsCount
);

public record UserBadgeDto(string BadgeKey, DateTime EarnedAt);
