using Microsoft.AspNetCore.Identity;

namespace LearnAfricaLite.Api.Models;

public class ApplicationUser : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;

    // Instructor-specific
    public InstructorApprovalStatus InstructorApprovalStatus { get; set; } = InstructorApprovalStatus.None;
    public string? InstructorTitle { get; set; }
    public string? InstructorPortfolio { get; set; }
    public string[] InstructorSkills { get; set; } = [];
    public DateTime? InstructorAppliedAt { get; set; }
    public DateTime? InstructorReviewedAt { get; set; }
    public Guid? InstructorReviewedByUserId { get; set; }
    public string? InstructorRejectionReason { get; set; }

    // Gamification
    public int Streak { get; set; }
    public bool NotificationsEmail { get; set; } = true;
    public bool NotificationsPush { get; set; } = false;
    public bool NotificationsUpdates { get; set; } = true;
    // True only once 2FA setup has been confirmed with a valid code — a secret
    // can exist (mid-setup) without this being true yet.
    public bool TwoFactorAppEnabled { get; set; } = false;
    public string? TwoFactorSecret { get; set; }
    public string Appearance { get; set; } = "system";

    // Instructor preferences
    public bool InstructorPayoutAlerts { get; set; } = true;
    public bool InstructorMessagesEnabled { get; set; } = true;

    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<UserBadge> Badges { get; set; } = new List<UserBadge>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
