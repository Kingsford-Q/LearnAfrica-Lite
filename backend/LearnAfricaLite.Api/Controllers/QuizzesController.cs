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

    [HttpPut("api/quizzes/{id:guid}")]
    [Authorize(Roles = $"{Roles.Instructor},{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<ActionResult<QuizSummaryDto>> Update(Guid id, UpdateQuizRequest request)
    {
        var quiz = await db.Quizzes.Include(q => q.Course).Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);
        if (quiz?.Course is null) return NotFound();
        if (!IsOwnerOrStaff(quiz.Course)) return Forbid();

        if (request.Questions.Any(q => !q.Options.Any(o => o.IsCorrect)))
            return BadRequest(new { message = "Every question must have exactly one correct option." });

        quiz.Title = request.Title;
        quiz.DurationSeconds = request.DurationSeconds <= 0 ? 180 : request.DurationSeconds;
        quiz.Order = request.Order;

        // Simplest correct way to apply an edited question set: replace it
        // entirely rather than diff — cascade delete cleans up the old
        // questions/options, and any past attempts/scores are untouched
        // since QuizAttempt only references the quiz, not its questions.
        db.QuizQuestions.RemoveRange(quiz.Questions);
        quiz.Questions = request.Questions.Select(q => new QuizQuestion
        {
            Text = q.Text,
            ImageUrl = q.ImageUrl,
            Order = q.Order,
            Options = q.Options.Select(o => new QuizOption { Text = o.Text, IsCorrect = o.IsCorrect, Order = o.Order }).ToList(),
        }).ToList();

        await db.SaveChangesAsync();
        return quiz.ToSummaryDto();
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
        var userId = User.GetUserId();

        // Every quiz submission — standalone or embedded in a lesson — records an
        // attempt. This is the source of truth for progress, certificates, and badges;
        // most quizzes created via the course builder are standalone (LessonId is null).
        await UpsertQuizAttemptAsync(db, id, userId, score);

        if (quiz.LessonId is not null)
        {
            var progress = await db.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == quiz.LessonId && lp.UserId == userId);
            if (progress is null)
            {
                progress = new LessonProgress { LessonId = quiz.LessonId.Value, UserId = userId };
                db.LessonProgresses.Add(progress);
            }
            progress.QuizScore = score;
            progress.IsCompleted = true;
            progress.CompletedAt ??= DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        await LessonsController.UpdateCourseProgressAsync(db, userId, quiz.CourseId);
        await db.SaveChangesAsync();
        await BadgeService.EvaluateAndAwardAsync(db, userId);

        return new QuizResultDto(score, correctCount, total, results);
    }

    // Two near-simultaneous submissions of the same quiz by the same user can both
    // pass the FirstOrDefaultAsync null-check before either commits, so a plain
    // insert can lose a race to the unique (UserId, QuizId) index and throw. Retry
    // once as an update against the row the other request just committed.
    private static async Task UpsertQuizAttemptAsync(AppDbContext db, Guid quizId, Guid userId, int score)
    {
        var attempt = await db.QuizAttempts.FirstOrDefaultAsync(a => a.QuizId == quizId && a.UserId == userId);
        if (attempt is not null)
        {
            attempt.Score = score;
            attempt.CompletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return;
        }

        attempt = new QuizAttempt { QuizId = quizId, UserId = userId, Score = score, CompletedAt = DateTime.UtcNow };
        db.QuizAttempts.Add(attempt);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            db.Entry(attempt).State = EntityState.Detached;
            attempt = await db.QuizAttempts.FirstAsync(a => a.QuizId == quizId && a.UserId == userId);
            attempt.Score = score;
            attempt.CompletedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    private bool IsOwnerOrStaff(Course course)
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.SuperAdmin)) return true;
        return User.GetUserId() == course.InstructorId;
    }
}
