using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(AppDbContext db) : ControllerBase
{
    private static NotificationDto ToDto(Models.Notification n) =>
        new(n.Id, n.Type.ToString().ToLowerInvariant(), n.Title, n.Message, n.IsRead, n.CreatedAt, n.ActionUrl);

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> List()
    {
        var userId = User.GetUserId();
        var now = DateTime.UtcNow;
        var notifications = await db.Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && (n.ExpiresAt == null || n.ExpiresAt > now))
            .OrderByDescending(n => n.CreatedAt)
            .Take(100)
            .ToListAsync();

        return notifications.Select(ToDto).ToList();
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> UnreadCount()
    {
        var userId = User.GetUserId();
        var now = DateTime.UtcNow;
        return await db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead && (n.ExpiresAt == null || n.ExpiresAt > now));
    }

    [HttpPost("{id:guid}/read")]
    public async Task<ActionResult<NotificationDto>> MarkAsRead(Guid id)
    {
        var userId = User.GetUserId();
        var notification = await db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (notification is null) return NotFound();

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await db.SaveChangesAsync();
        }

        return ToDto(notification);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.GetUserId();
        await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(setters => setters.SetProperty(n => n.IsRead, true));

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        var notification = await db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (notification is null) return NotFound();

        db.Notifications.Remove(notification);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
