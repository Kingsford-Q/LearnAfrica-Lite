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
public class SectionsController(AppDbContext db) : ControllerBase
{
    [HttpPost("api/courses/{courseId:guid}/sections")]
    public async Task<ActionResult<SectionDto>> Create(Guid courseId, CreateSectionRequest request)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null) return NotFound();
        if (!IsOwnerOrStaff(course)) return Forbid();

        var section = new Section { CourseId = courseId, Title = request.Title, Order = request.Order };
        db.Sections.Add(section);
        await db.SaveChangesAsync();

        return new SectionDto(section.Id, section.Title, section.Order, [], []);
    }

    [HttpPut("api/sections/{id:guid}")]
    public async Task<ActionResult<SectionDto>> Update(Guid id, UpdateSectionRequest request)
    {
        var section = await db.Sections.Include(s => s.Course)
            .Include(s => s.Lessons).Include(s => s.Quizzes)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (section?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(section.Course)) return Forbid();

        if (request.Title is not null) section.Title = request.Title;
        if (request.Order is not null) section.Order = request.Order.Value;
        await db.SaveChangesAsync();

        return section.ToDto();
    }

    [HttpDelete("api/sections/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var section = await db.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == id);
        if (section?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(section.Course)) return Forbid();

        db.Sections.Remove(section);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool IsOwnerOrStaff(Course course)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == course.InstructorId;
    }
}
