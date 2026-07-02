using System.ComponentModel.DataAnnotations;

namespace LearnAfricaLite.Api.DTOs;

public record SendAnnouncementRequest(
    [Required, MaxLength(150)] string Title,
    [Required, MaxLength(2000)] string Message
);

public record AnnouncementResultDto(int RecipientCount);
