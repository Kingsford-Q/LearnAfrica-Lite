using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
public class LessonsController(AppDbContext db) : ControllerBase
{
    [HttpPost("api/sections/{sectionId:guid}/lessons")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<LessonDetailDto>> Create(Guid sectionId, CreateLessonRequest request)
    {
        var section = await db.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == sectionId);
        if (section?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(section.Course)) return Forbid();

        var lesson = new Lesson
        {
            CourseId = section.CourseId,
            SectionId = sectionId,
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            Duration = request.Duration ?? string.Empty,
            VideoUrl = request.VideoUrl,
            VideoFile = request.VideoFile,
            Content = request.Content ?? string.Empty,
            Order = request.Order,
        };

        db.Lessons.Add(lesson);
        await db.SaveChangesAsync();

        return lesson.ToDetailDto(false, null);
    }

    [HttpGet("api/lessons/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<LessonDetailDto>> Get(Guid id)
    {
        var lesson = await db.Lessons.Include(l => l.Resources).Include(l => l.Course)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null) return NotFound();

        var userId = User.GetUserId();
        var progress = await db.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == id && lp.UserId == userId);

        return lesson.ToDetailDto(progress?.IsCompleted ?? false, progress?.QuizScore);
    }

    [HttpPut("api/lessons/{id:guid}")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<LessonDetailDto>> Update(Guid id, UpdateLessonRequest request)
    {
        var lesson = await db.Lessons.Include(l => l.Course).Include(l => l.Resources)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (lesson?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(lesson.Course)) return Forbid();

        if (request.Title is not null) lesson.Title = request.Title;
        if (request.Description is not null) lesson.Description = request.Description;
        if (request.Duration is not null) lesson.Duration = request.Duration;
        if (request.VideoUrl is not null) lesson.VideoUrl = request.VideoUrl;
        if (request.VideoFile is not null) lesson.VideoFile = request.VideoFile;
        if (request.Content is not null) lesson.Content = request.Content;
        if (request.Order is not null) lesson.Order = request.Order.Value;

        await db.SaveChangesAsync();
        return lesson.ToDetailDto(false, null);
    }

    [HttpDelete("api/lessons/{id:guid}")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var lesson = await db.Lessons.Include(l => l.Course).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(lesson.Course)) return Forbid();

        db.Lessons.Remove(lesson);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("api/lessons/{id:guid}/complete")]
    [Authorize]
    public async Task<ActionResult<LessonDetailDto>> Complete(Guid id)
    {
        var lesson = await db.Lessons.Include(l => l.Resources).FirstOrDefaultAsync(l => l.Id == id);
        if (lesson is null) return NotFound();

        var userId = User.GetUserId();
        var progress = await db.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == id && lp.UserId == userId);
        if (progress is null)
        {
            progress = new LessonProgress { LessonId = id, UserId = userId };
            db.LessonProgresses.Add(progress);
        }
        progress.IsCompleted = true;
        progress.CompletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(); // persist before recomputing progress, which re-queries the DB

        await UpdateCourseProgressAsync(db, userId, lesson.CourseId);
        await db.SaveChangesAsync();
        await BadgeService.EvaluateAndAwardAsync(db, userId);

        return lesson.ToDetailDto(true, progress.QuizScore);
    }

    // A quiz score at or above this counts as "passed" for progress/certificate purposes.
    // Matches the pass threshold shown to students on the quiz results page.
    internal const int PassingQuizScore = 70;

    internal static async Task UpdateCourseProgressAsync(AppDbContext db, Guid userId, Guid courseId)
    {
        var enrollment = await db.Enrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (enrollment is null) return;

        var courseLessonIds = await db.Lessons.Where(l => l.CourseId == courseId).Select(l => l.Id).ToListAsync();
        // Standalone quizzes (not embedded in a lesson) are their own gradeable curriculum
        // items — the course builder creates all quizzes this way, so without counting
        // them here, progress (and certificate eligibility) would ignore quizzes entirely.
        // A quiz with zero questions can never score high enough to "pass" (it always
        // scores 0), so it's excluded here rather than permanently capping progress for
        // every enrolled student — request validation now blocks creating one, but this
        // guards against any that already exist.
        var standaloneQuizIds = await db.Quizzes
            .Where(q => q.CourseId == courseId && q.LessonId == null && q.Questions.Count > 0)
            .Select(q => q.Id)
            .ToListAsync();

        var totalItems = courseLessonIds.Count + standaloneQuizIds.Count;
        if (totalItems == 0) return;

        var completedLessons = await db.LessonProgresses
            .CountAsync(lp => lp.UserId == userId && courseLessonIds.Contains(lp.LessonId) && lp.IsCompleted);
        var passedQuizzes = await db.QuizAttempts
            .CountAsync(a => a.UserId == userId && standaloneQuizIds.Contains(a.QuizId) && a.Score >= PassingQuizScore);

        var completedCount = completedLessons + passedQuizzes;

        enrollment.ProgressPercent = (int)Math.Round(completedCount * 100.0 / totalItems);

        if (enrollment.CompletedAt is not null)
        {
            // The course was already completed and certified. A later quiz retake
            // that scores lower must not regress progress back below 100 or leave
            // "certified but <100% progress" showing in the UI — the certificate
            // isn't revoked just because a passed quiz was retaken.
            enrollment.ProgressPercent = Math.Max(enrollment.ProgressPercent, 100);
        }
        else if (enrollment.ProgressPercent >= 100)
        {
            enrollment.CompletedAt = DateTime.UtcNow;
            await CertificateIssuer.IssueIfEligibleAsync(db, userId, courseId);
        }
    }

    private bool IsOwnerOrStaff(Course course)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == course.InstructorId;
    }
}
