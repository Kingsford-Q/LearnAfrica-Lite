using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Authorize]
public class ForumController(AppDbContext db) : ControllerBase
{
    [HttpGet("api/lessons/{lessonId:guid}/forum/threads")]
    public async Task<ActionResult<List<ForumThreadDto>>> ListThreads(Guid lessonId)
    {
        var threads = await db.ForumThreads.AsNoTracking()
            .Include(t => t.User)
            .Where(t => t.LessonId == lessonId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new ForumThreadDto(
                t.Id, t.LessonId, t.UserId, t.User!.Name, t.User.Avatar,
                t.Title, t.Body, t.CreatedAt, t.Replies.Count))
            .ToListAsync();

        return threads;
    }

    [HttpPost("api/lessons/{lessonId:guid}/forum/threads")]
    public async Task<ActionResult<ForumThreadDetailDto>> CreateThread(Guid lessonId, CreateForumThreadRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(new { message = "Title and body are required." });

        var lessonExists = await db.Lessons.AnyAsync(l => l.Id == lessonId);
        if (!lessonExists) return NotFound();

        var thread = new ForumThread
        {
            LessonId = lessonId,
            UserId = User.GetUserId(),
            Title = request.Title.Trim(),
            Body = request.Body.Trim(),
        };
        db.ForumThreads.Add(thread);
        await db.SaveChangesAsync();
        await BadgeService.EvaluateAndAwardAsync(db, thread.UserId);

        var dto = await GetThreadDetailAsync(thread.Id);
        return dto is null ? NotFound() : dto;
    }

    [HttpGet("api/forum/threads/{id:guid}")]
    public async Task<ActionResult<ForumThreadDetailDto>> GetThread(Guid id)
    {
        var dto = await GetThreadDetailAsync(id);
        return dto is null ? NotFound() : dto;
    }

    [HttpPost("api/forum/threads/{id:guid}/replies")]
    public async Task<ActionResult<ForumReplyDto>> Reply(Guid id, CreateForumReplyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(new { message = "Reply body is required." });

        var thread = await db.ForumThreads.FirstOrDefaultAsync(t => t.Id == id);
        if (thread is null) return NotFound();

        var userId = User.GetUserId();
        var reply = new ForumReply
        {
            ThreadId = id,
            UserId = userId,
            Body = request.Body.Trim(),
        };
        db.ForumReplies.Add(reply);
        await db.SaveChangesAsync();
        await BadgeService.EvaluateAndAwardAsync(db, userId);

        if (thread.UserId != userId)
        {
            var courseId = await db.Lessons.Where(l => l.Id == thread.LessonId).Select(l => l.CourseId).FirstOrDefaultAsync();
            var actionUrl = courseId != Guid.Empty ? $"/learn/course/{courseId}/lesson/{thread.LessonId}" : null;
            await AuthController.NotifyAsync(db, thread.UserId, NotificationType.Community,
                "New reply to your discussion", $"Someone replied to \"{thread.Title}\".", actionUrl: actionUrl);
        }

        var user = await db.Users.FirstAsync(u => u.Id == userId);
        return new ForumReplyDto(reply.Id, reply.ThreadId, reply.UserId, user.Name, user.Avatar, reply.Body, reply.CreatedAt);
    }

    [HttpDelete("api/forum/threads/{id:guid}")]
    public async Task<IActionResult> DeleteThread(Guid id)
    {
        var thread = await db.ForumThreads.FirstOrDefaultAsync(t => t.Id == id);
        if (thread is null) return NotFound();
        if (!IsOwnerOrStaff(thread.UserId)) return Forbid();

        db.ForumThreads.Remove(thread);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("api/forum/replies/{id:guid}")]
    public async Task<IActionResult> DeleteReply(Guid id)
    {
        var reply = await db.ForumReplies.FirstOrDefaultAsync(r => r.Id == id);
        if (reply is null) return NotFound();
        if (!IsOwnerOrStaff(reply.UserId)) return Forbid();

        db.ForumReplies.Remove(reply);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<ForumThreadDetailDto?> GetThreadDetailAsync(Guid id)
    {
        return await db.ForumThreads.AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.Replies).ThenInclude(r => r.User)
            .Where(t => t.Id == id)
            .Select(t => new ForumThreadDetailDto(
                t.Id, t.LessonId, t.UserId, t.User!.Name, t.User.Avatar,
                t.Title, t.Body, t.CreatedAt,
                t.Replies.OrderBy(r => r.CreatedAt).Select(r =>
                    new ForumReplyDto(r.Id, r.ThreadId, r.UserId, r.User!.Name, r.User.Avatar, r.Body, r.CreatedAt)).ToList()))
            .FirstOrDefaultAsync();
    }

    private bool IsOwnerOrStaff(Guid resourceOwnerId)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == resourceOwnerId;
    }
}
