using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/admin/announcements")]
[Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
public class AnnouncementsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<AnnouncementResultDto>> Send(SendAnnouncementRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Title and message are required." });

        // Respects each user's "Product Updates" notification preference — an
        // announcement is exactly the kind of thing that toggle exists to gate.
        var recipientIds = await db.Users
            .Where(u => u.NotificationsUpdates)
            .Select(u => u.Id)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var notifications = recipientIds.Select(userId => new Notification
        {
            UserId = userId,
            Type = NotificationType.Announcement,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            CreatedAt = now,
        });

        db.Notifications.AddRange(notifications);
        await db.SaveChangesAsync();

        return new AnnouncementResultDto(recipientIds.Count);
    }
}
