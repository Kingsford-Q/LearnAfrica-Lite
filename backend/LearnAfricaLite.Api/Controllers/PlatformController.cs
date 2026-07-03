using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

public record PlatformStatsDto(
    int TotalStudents,
    int TotalCourses,
    int TotalInstructors,
    int CompletionRatePercent,
    int TotalCertificates,
    int TotalLessons
);

[ApiController]
[Route("api/platform")]
public class PlatformController(AppDbContext db) : ControllerBase
{
    // Public, unauthenticated — powers the real numbers shown on the landing
    // and auth pages, replacing what used to be hardcoded marketing copy.
    [HttpGet("stats")]
    public async Task<ActionResult<PlatformStatsDto>> Stats()
    {
        var totalStudents = await db.Users.CountAsync();
        var totalCourses = await db.Courses.CountAsync(c => c.Status == CourseStatus.Published);
        var totalInstructors = await db.Users.CountAsync(u => u.InstructorApprovalStatus == InstructorApprovalStatus.Approved);
        var totalCertificates = await db.Certificates.CountAsync();
        var totalLessons = await db.Lessons.CountAsync();

        var totalEnrollments = await db.Enrollments.CountAsync();
        var completedEnrollments = await db.Enrollments.CountAsync(e => e.CompletedAt != null);
        var completionRate = totalEnrollments == 0 ? 0 : (int)Math.Round(completedEnrollments * 100.0 / totalEnrollments);

        return new PlatformStatsDto(totalStudents, totalCourses, totalInstructors, completionRate, totalCertificates, totalLessons);
    }
}
