using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
public class QuizzesController(AppDbContext db) : ControllerBase
{
    [HttpPost("api/sections/{sectionId:guid}/quizzes")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<QuizSummaryDto>> Create(Guid sectionId, CreateQuizRequest request)
    {
        var section = await db.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == sectionId);
        if (section?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(section.Course)) return Forbid();

        if (request.Questions.Any(q => !q.Options.Any(o => o.IsCorrect)))
            return BadRequest(new { message = "Every question must have exactly one correct option." });

        var quiz = new Quiz
        {
            SectionId = sectionId,
            CourseId = section.CourseId,
            LessonId = request.LessonId,
            Title = request.Title,
            DurationSeconds = request.DurationSeconds <= 0 ? 180 : request.DurationSeconds,
            Order = request.Order,
            Questions = request.Questions.Select(q => new QuizQuestion
            {
                Text = q.Text,
                ImageUrl = q.ImageUrl,
                Order = q.Order,
                Options = q.Options.Select(o => new QuizOption { Text = o.Text, IsCorrect = o.IsCorrect, Order = o.Order }).ToList(),
            }).ToList(),
        };

        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        return quiz.ToSummaryDto();
    }

    [HttpGet("api/quizzes/{id:guid}")]
    [Authorize]
    public async Task<ActionResult<QuizDetailDto>> Get(Guid id)
    {
        var quiz = await db.Quizzes.Include(q => q.Questions).ThenInclude(qq => qq.Options)
            .FirstOrDefaultAsync(q => q.Id == id);
        if (quiz is null) return NotFound();

        return quiz.ToDetailDto();
    }

    [HttpDelete("api/quizzes/{id:guid}")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var quiz = await db.Quizzes.Include(q => q.Course).FirstOrDefaultAsync(q => q.Id == id);
        if (quiz?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(quiz.Course)) return Forbid();

        db.Quizzes.Remove(quiz);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("api/quizzes/{id:guid}/submit")]
    [Authorize]
    public async Task<ActionResult<QuizResultDto>> Submit(Guid id, SubmitQuizAttemptRequest request)
    {
        var quiz = await db.Quizzes.Include(q => q.Questions).ThenInclude(qq => qq.Options)
            .FirstOrDefaultAsync(q => q.Id == id);
        if (quiz is null) return NotFound();

        var results = new List<QuizAnswerResultDto>();
        var correctCount = 0;

        foreach (var question in quiz.Questions)
        {
            var correctOption = question.Options.First(o => o.IsCorrect);
            var answer = request.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            var isCorrect = answer is not null && answer.SelectedOptionId == correctOption.Id;
            if (isCorrect) correctCount++;

            results.Add(new QuizAnswerResultDto(question.Id, answer?.SelectedOptionId ?? Guid.Empty, correctOption.Id, isCorrect));
        }

        var total = quiz.Questions.Count;
        var score = total == 0 ? 0 : (int)Math.Round(correctCount * 100.0 / total);

        if (quiz.LessonId is not null)
        {
            var userId = User.GetUserId();
            var progress = await db.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == quiz.LessonId && lp.UserId == userId);
            if (progress is null)
            {
                progress = new LessonProgress { LessonId = quiz.LessonId.Value, UserId = userId };
                db.LessonProgresses.Add(progress);
            }
            progress.QuizScore = score;
            progress.IsCompleted = true;
            progress.CompletedAt ??= DateTime.UtcNow;
            await db.SaveChangesAsync(); // persist before recomputing progress, which re-queries the DB

            await LessonsController.UpdateCourseProgressAsync(db, userId, quiz.CourseId);
            await db.SaveChangesAsync();
        }

        return new QuizResultDto(score, correctCount, total, results);
    }

    private bool IsOwnerOrStaff(Course course)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == course.InstructorId;
    }
}
