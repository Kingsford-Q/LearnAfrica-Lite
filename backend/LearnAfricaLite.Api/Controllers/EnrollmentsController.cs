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
public class EnrollmentsController(AppDbContext db) : ControllerBase
{
    [HttpPost("api/courses/{courseId:guid}/enroll")]
    public async Task<ActionResult<EnrollmentDto>> Enroll(Guid courseId)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == courseId && c.Status == CourseStatus.Published);
        if (course is null) return NotFound();

        var userId = User.GetUserId();
        var existing = await db.Enrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (existing is not null)
            return new EnrollmentDto(existing.CourseId, existing.ProgressPercent, existing.EnrolledAt, existing.CompletedAt);

        var enrollment = new Enrollment { UserId = userId, CourseId = courseId };
        db.Enrollments.Add(enrollment);

        if (course.InstructorId != userId)
        {
            await AuthController.NotifyAsync(db, course.InstructorId, NotificationType.Enrollment,
                "New student enrolled", $"Someone just enrolled in \"{course.Title}\".");
        }

        await db.SaveChangesAsync();

        return new EnrollmentDto(enrollment.CourseId, enrollment.ProgressPercent, enrollment.EnrolledAt, enrollment.CompletedAt);
    }

    [HttpGet("api/enrollments/mine")]
    public async Task<ActionResult<List<EnrollmentDto>>> Mine()
    {
        var userId = User.GetUserId();
        var enrollments = await db.Enrollments.AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => new EnrollmentDto(e.CourseId, e.ProgressPercent, e.EnrolledAt, e.CompletedAt))
            .ToListAsync();

        return enrollments;
    }

    [HttpGet("api/courses/{courseId:guid}/students")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<List<object>>> Students(Guid courseId)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null) return NotFound();

        var isOwner = User.GetUserId() == course.InstructorId;
        var isStaff = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin);
        if (!isOwner && !isStaff) return Forbid();

        var students = await db.Enrollments.AsNoTracking()
            .Where(e => e.CourseId == courseId)
            .Include(e => e.User)
            .OrderByDescending(e => e.EnrolledAt)
            .Select(e => new
            {
                userId = e.UserId,
                name = e.User!.Name,
                avatar = e.User.Avatar,
                email = e.User.Email,
                progress = e.ProgressPercent,
                enrolledAt = e.EnrolledAt,
                completedAt = e.CompletedAt,
            })
            .ToListAsync();

        return students.Cast<object>().ToList();
    }
}
