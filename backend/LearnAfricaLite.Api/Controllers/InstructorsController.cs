using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/instructors")]
public class InstructorsController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<object>> Get(Guid id)
    {
        var instructor = await db.Users.AsNoTracking()
            .Where(u => u.Id == id && u.InstructorApprovalStatus == InstructorApprovalStatus.Approved)
            .FirstOrDefaultAsync();
        if (instructor is null) return NotFound();

        var courses = await db.Courses.AsNoTracking()
            .Where(c => c.InstructorId == id && c.Status == CourseStatus.Published)
            .Include(c => c.Reviews).Include(c => c.Enrollments)
            .ToListAsync();

        var allReviews = courses.SelectMany(c => c.Reviews).ToList();
        var rating = allReviews.Count > 0 ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0;

        return new
        {
            id = instructor.Id,
            name = instructor.Name,
            title = instructor.InstructorTitle,
            avatar = instructor.Avatar,
            bio = instructor.Bio,
            portfolio = instructor.InstructorPortfolio,
            skills = instructor.InstructorSkills,
            coursesCount = courses.Count,
            totalStudents = courses.Sum(c => c.Enrollments.Count),
            rating,
        };
    }
}
