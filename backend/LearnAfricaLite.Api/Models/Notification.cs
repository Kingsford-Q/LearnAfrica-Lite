namespace LearnAfricaLite.Api.Models;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public NotificationType Type { get; set; } = NotificationType.Info;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Prevents duplicate milestone/system notifications (e.g. "badge_QUIZ_MASTER")
    public string? DedupeKey { get; set; }

    // Relative frontend route (e.g. "/certificate/{courseId}") the "Open Activity"
    // button in the notification detail view navigates to. Null means the
    // notification is informational only and has no associated destination.
    public string? ActionUrl { get; set; }

    // Null means it never expires. Currently only set on platform announcements,
    // which the admin can choose to auto-expire instead of lingering forever.
    // NotificationsController excludes expired rows from every read (list,
    // unread count) rather than needing a cleanup job to delete them.
    public DateTime? ExpiresAt { get; set; }
}
