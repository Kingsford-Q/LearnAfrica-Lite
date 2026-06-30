using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
public class ResourcesController(AppDbContext db) : ControllerBase
{
    [HttpPost("api/lessons/{lessonId:guid}/resources")]
    public async Task<ActionResult<ResourceDto>> Create(Guid lessonId, CreateResourceRequest request)
    {
        var lesson = await db.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(lesson.Course)) return Forbid();

        var resource = new Resource { LessonId = lessonId, Title = request.Title, Url = request.Url, Type = request.Type };
        db.Resources.Add(resource);
        await db.SaveChangesAsync();

        return resource.ToDto();
    }

    [HttpDelete("api/resources/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var resource = await db.Resources.Include(r => r.Lesson).ThenInclude(l => l!.Course).FirstOrDefaultAsync(r => r.Id == id);
        if (resource?.Lesson?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(resource.Lesson.Course)) return Forbid();

        db.Resources.Remove(resource);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool IsOwnerOrStaff(Course course)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == course.InstructorId;
    }
}
