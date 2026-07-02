using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/admin/instructors")]
[Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
public class AdminInstructorsController(AppDbContext db) : ControllerBase
{
    private static InstructorApplicationDto ToDto(ApplicationUser u) => new(
        u.Id, u.Name, u.Email ?? string.Empty, u.Avatar, u.Bio,
        u.InstructorTitle, u.InstructorPortfolio, u.InstructorSkills,
        u.InstructorApprovalStatus.ToString(), u.InstructorAppliedAt, u.InstructorReviewedAt, u.InstructorRejectionReason
    );

    [HttpGet]
    public async Task<ActionResult<List<InstructorApplicationDto>>> List([FromQuery] string? status)
    {
        var query = db.Users.AsNoTracking().Where(u => u.InstructorApprovalStatus != InstructorApprovalStatus.None);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<InstructorApprovalStatus>(status, true, out var parsed))
            query = query.Where(u => u.InstructorApprovalStatus == parsed);

        var users = await query.OrderByDescending(u => u.InstructorAppliedAt).ToListAsync();
        return users.Select(ToDto).ToList();
    }

    [HttpPost("{userId:guid}/approve")]
    public async Task<ActionResult<InstructorApplicationDto>> Approve(Guid userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.InstructorApprovalStatus = InstructorApprovalStatus.Approved;
        user.InstructorReviewedAt = DateTime.UtcNow;
        user.InstructorReviewedByUserId = User.GetUserId();
        user.InstructorRejectionReason = null;

        await AuthController.NotifyAsync(db, userId, NotificationType.System,
            "Instructor application approved", "You're approved! You can now create and publish courses.",
            actionUrl: "/instructor/courses/create");

        await db.SaveChangesAsync();
        return ToDto(user);
    }

    [HttpPost("{userId:guid}/reject")]
    public async Task<ActionResult<InstructorApplicationDto>> Reject(Guid userId, RejectInstructorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            return BadRequest(new { message = "A rejection reason is required." });

        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.InstructorApprovalStatus = InstructorApprovalStatus.Rejected;
        user.InstructorReviewedAt = DateTime.UtcNow;
        user.InstructorReviewedByUserId = User.GetUserId();
        user.InstructorRejectionReason = request.Reason;

        await AuthController.NotifyAsync(db, userId, NotificationType.System,
            "Instructor application rejected", $"Your instructor application was not approved: {request.Reason}");

        await db.SaveChangesAsync();
        return ToDto(user);
    }
}
