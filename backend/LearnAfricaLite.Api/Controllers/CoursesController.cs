using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/courses")]
public class CoursesController(AppDbContext db) : ControllerBase
{
    private static IQueryable<Course> IncludeGraph(IQueryable<Course> query) => query
        .Include(c => c.Instructor)
        .Include(c => c.Reviews)
        .Include(c => c.Enrollments)
        .Include(c => c.Sections).ThenInclude(s => s.Lessons)
        .Include(c => c.Sections).ThenInclude(s => s.Quizzes);

    [HttpGet]
    public async Task<ActionResult<List<CourseSummaryDto>>> List(
        [FromQuery] string? category, [FromQuery] string? difficulty, [FromQuery] string? search)
    {
        var query = IncludeGraph(db.Courses.AsNoTracking())
            .Where(c => c.Status == CourseStatus.Published);

        if (!string.IsNullOrWhiteSpace(category) && category != "All Categories")
            query = query.Where(c => c.Category == category);

        if (!string.IsNullOrWhiteSpace(difficulty) && difficulty != "All Levels")
            query = query.Where(c => c.Difficulty == difficulty);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search));

        var courses = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return courses.Select(c => c.ToSummaryDto()).ToList();
    }

    [HttpGet("mine")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<List<CourseSummaryDto>>> Mine()
    {
        var userId = User.GetUserId();
        var courses = await IncludeGraph(db.Courses.AsNoTracking())
            .Where(c => c.InstructorId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return courses.Select(c => c.ToSummaryDto()).ToList();
    }

    [HttpGet("mine/stats")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<InstructorStatsDto>> MyStats()
    {
        var userId = User.GetUserId();
        var courses = await db.Courses.AsNoTracking()
            .Where(c => c.InstructorId == userId)
            .Include(c => c.Reviews)
            .Include(c => c.Enrollments).ThenInclude(e => e.User)
            .ToListAsync();

        var enrollmentRows = courses
            .SelectMany(c => c.Enrollments.Select(e => new { Enrollment = e, CourseTitle = c.Title, CoursePrice = c.Price }))
            .ToList();

        var totalStudents = enrollmentRows.Select(r => r.Enrollment.UserId).Distinct().Count();
        var allReviews = courses.SelectMany(c => c.Reviews).ToList();
        var averageRating = allReviews.Count > 0 ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0;
        var completionRate = enrollmentRows.Count > 0
            ? (int)Math.Round(enrollmentRows.Count(r => r.Enrollment.ProgressPercent == 100) * 100.0 / enrollmentRows.Count)
            : 0;
        var totalEarnings = courses.Sum(c => c.Price * c.Enrollments.Count);

        var now = DateTime.UtcNow;
        var monthlyEnrollments = Enumerable.Range(0, 6)
            .Select(i => now.AddMonths(-5 + i))
            .Select(date => new MonthlyEnrollmentDto(
                date.ToString("MMM"),
                enrollmentRows.Count(r => r.Enrollment.EnrolledAt.Year == date.Year && r.Enrollment.EnrolledAt.Month == date.Month)
            )).ToList();

        var monthlyRevenue = Enumerable.Range(0, 6)
            .Select(i => now.AddMonths(-5 + i))
            .Select(date => new MonthlyRevenueDto(
                date.ToString("MMM"),
                enrollmentRows.Where(r => r.Enrollment.EnrolledAt.Year == date.Year && r.Enrollment.EnrolledAt.Month == date.Month)
                    .Sum(r => r.CoursePrice)
            )).ToList();

        var coursePerformance = courses
            .OrderByDescending(c => c.Enrollments.Count)
            .Take(5)
            .Select(c => new CoursePerformanceDto(
                c.Title, c.Enrollments.Count,
                c.Enrollments.Count > 0
                    ? (int)Math.Round(c.Enrollments.Count(e => e.ProgressPercent == 100) * 100.0 / c.Enrollments.Count)
                    : 0,
                c.Reviews.Count > 0 ? Math.Round(c.Reviews.Average(r => r.Rating), 1) : 0,
                c.Price * c.Enrollments.Count
            )).ToList();

        var recentStudents = enrollmentRows
            .OrderByDescending(r => r.Enrollment.EnrolledAt)
            .Take(5)
            .Select(r => new RecentStudentDto(
                r.Enrollment.UserId, r.Enrollment.User?.Name ?? "Student", r.CourseTitle,
                r.Enrollment.EnrolledAt, r.Enrollment.ProgressPercent
            )).ToList();

        var completionBreakdown = new CompletionBreakdownDto(
            enrollmentRows.Count(r => r.Enrollment.ProgressPercent == 100),
            enrollmentRows.Count(r => r.Enrollment.ProgressPercent is > 0 and < 100),
            enrollmentRows.Count(r => r.Enrollment.ProgressPercent == 0)
        );

        var courseIds = courses.Select(c => c.Id).ToList();
        var last7Days = Enumerable.Range(0, 7).Select(i => now.Date.AddDays(-6 + i)).ToList();
        var recentLessonCompletions = await db.LessonProgresses.AsNoTracking()
            .Where(lp => lp.IsCompleted && lp.CompletedAt != null
                && courseIds.Contains(lp.Lesson!.CourseId)
                && lp.CompletedAt >= last7Days[0])
            .Select(lp => lp.CompletedAt!.Value.Date)
            .ToListAsync();
        var weeklyActivity = last7Days
            .Select(day => new WeeklyActivityDto(
                day.ToString("ddd"),
                enrollmentRows.Count(r => r.Enrollment.EnrolledAt.Date == day),
                recentLessonCompletions.Count(d => d == day)
            )).ToList();

        return new InstructorStatsDto(
            courses.Count, totalStudents, totalEarnings, averageRating, completionRate,
            monthlyEnrollments, monthlyRevenue, coursePerformance, recentStudents,
            completionBreakdown, weeklyActivity
        );
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CourseDetailDto>> Get(Guid id)
    {
        var course = await IncludeGraph(db.Courses.AsNoTracking()).FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return NotFound();

        if (course.Status != CourseStatus.Published)
        {
            var userId = User.Identity?.IsAuthenticated == true ? User.GetUserId() : (Guid?)null;
            var isOwner = userId == course.InstructorId;
            var isStaff = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin);
            if (!isOwner && !isStaff) return NotFound();
        }

        ISet<Guid>? completedLessonIds = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var requesterId = User.GetUserId();
            completedLessonIds = (await db.LessonProgresses.AsNoTracking()
                .Where(lp => lp.UserId == requesterId && lp.IsCompleted && lp.Lesson!.CourseId == id)
                .Select(lp => lp.LessonId)
                .ToListAsync()).ToHashSet();
        }

        return course.ToDetailDto(completedLessonIds);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<CourseDetailDto>> Create(CreateCourseRequest request)
    {
        var userId = User.GetUserId();
        var instructor = await db.Users.FindAsync(userId);
        if (instructor is null) return Forbid();

        var isStaff = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin);
        if (!isStaff && instructor.InstructorApprovalStatus != InstructorApprovalStatus.Approved)
            return Forbid();

        var course = new Course
        {
            Title = request.Title,
            Description = request.Description,
            InstructorId = userId,
            Category = request.Category,
            Difficulty = request.Difficulty,
            Duration = request.Duration ?? string.Empty,
            Language = string.IsNullOrWhiteSpace(request.Language) ? "English" : request.Language,
            Price = request.IsFree ? 0 : request.Price,
            IsFree = request.IsFree,
            PaymentLink = request.PaymentLink,
            Tags = request.Tags ?? [],
            LearningOutcomes = request.LearningOutcomes ?? [],
            HasCertificate = request.HasCertificate,
            HasLifetimeAccess = request.HasLifetimeAccess,
            HasResources = request.HasResources,
            Thumbnail = request.Thumbnail,
            Status = CourseStatus.Draft,
        };

        db.Courses.Add(course);
        await db.SaveChangesAsync();

        course.Instructor = instructor;
        return CreatedAtAction(nameof(Get), new { id = course.Id }, course.ToDetailDto());
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<CourseDetailDto>> Update(Guid id, UpdateCourseRequest request)
    {
        var course = await IncludeGraph(db.Courses).FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return NotFound();
        if (!IsOwnerOrStaff(course)) return Forbid();

        if (request.Title is not null) course.Title = request.Title;
        if (request.Description is not null) course.Description = request.Description;
        if (request.Category is not null) course.Category = request.Category;
        if (request.Difficulty is not null) course.Difficulty = request.Difficulty;
        if (request.Duration is not null) course.Duration = request.Duration;
        if (request.Language is not null) course.Language = request.Language;
        if (request.IsFree is not null) course.IsFree = request.IsFree.Value;
        if (request.Price is not null) course.Price = course.IsFree ? 0 : request.Price.Value;
        if (request.PaymentLink is not null) course.PaymentLink = request.PaymentLink;
        if (request.Tags is not null) course.Tags = request.Tags;
        if (request.LearningOutcomes is not null) course.LearningOutcomes = request.LearningOutcomes;
        if (request.HasCertificate is not null) course.HasCertificate = request.HasCertificate.Value;
        if (request.HasLifetimeAccess is not null) course.HasLifetimeAccess = request.HasLifetimeAccess.Value;
        if (request.HasResources is not null) course.HasResources = request.HasResources.Value;
        if (request.Thumbnail is not null) course.Thumbnail = request.Thumbnail;
        if (request.Status is not null) course.Status = request.Status.Value;
        course.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return course.ToDetailDto();
    }

    [HttpPost("{id:guid}/publish")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<CourseDetailDto>> Publish(Guid id)
    {
        var course = await IncludeGraph(db.Courses).FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return NotFound();
        if (!IsOwnerOrStaff(course)) return Forbid();

        course.Status = CourseStatus.Published;
        course.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return course.ToDetailDto();
    }

    [HttpPost("{id:guid}/unpublish")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<CourseDetailDto>> Unpublish(Guid id)
    {
        var course = await IncludeGraph(db.Courses).FirstOrDefaultAsync(c => c.Id == id);
        if (course is null) return NotFound();
        if (!IsOwnerOrStaff(course)) return Forbid();

        course.Status = CourseStatus.Draft;
        course.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return course.ToDetailDto();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var course = await db.Courses.FindAsync(id);
        if (course is null) return NotFound();
        if (!IsOwnerOrStaff(course)) return Forbid();

        db.Courses.Remove(course);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private bool IsOwnerOrStaff(Course course)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == course.InstructorId;
    }
}
