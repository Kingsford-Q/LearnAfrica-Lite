using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    [HttpGet("api/courses/{courseId:guid}/reviews")]
    public async Task<ActionResult<List<ReviewDto>>> List(Guid courseId)
    {
        var reviews = await db.Reviews.AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.CourseId == courseId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(r.Id, r.CourseId, r.UserId, r.User!.Name, r.User.Avatar, r.Rating, r.Comment, r.CreatedAt))
            .ToListAsync();

        return reviews;
    }

    [HttpPost("api/courses/{courseId:guid}/reviews")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Upsert(Guid courseId, CreateReviewRequest request)
    {
        if (request.Rating is < 1 or > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null) return NotFound();

        var userId = User.GetUserId();
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.CourseId == courseId && r.UserId == userId);

        if (review is null)
        {
            review = new Review { CourseId = courseId, UserId = userId, Rating = request.Rating, Comment = request.Comment };
            db.Reviews.Add(review);

            if (course.InstructorId != userId)
            {
                await AuthController.NotifyAsync(db, course.InstructorId, NotificationType.Community,
                    "New review", $"Your course \"{course.Title}\" received a new review.", actionUrl: "/instructor/reviews");
            }
        }
        else
        {
            review.Rating = request.Rating;
            review.Comment = request.Comment;
        }

        var user = await db.Users.FindAsync(userId);
        await db.SaveChangesAsync();
        await BadgeService.EvaluateAndAwardAsync(db, userId);

        return new ReviewDto(review.Id, review.CourseId, review.UserId, user?.Name ?? string.Empty, user?.Avatar, review.Rating, review.Comment, review.CreatedAt);
    }
}
