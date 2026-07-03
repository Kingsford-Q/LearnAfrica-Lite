using System.ComponentModel.DataAnnotations;

namespace LearnAfricaLite.Api.DTOs;

public record SendAnnouncementRequest(
    [Required, MaxLength(150)] string Title,
    [Required, MaxLength(2000)] string Message,
    // Null (or omitted) means it never expires. When set, the notification
    // stops appearing for recipients after this many days.
    [Range(1, 365)] int? DurationDays
);

public record AnnouncementResultDto(int RecipientCount);
