using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.Models;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

public record AdminUserDto(Guid Id, string Name, string Email, string Role, DateTime JoinedDate);

// General account moderation — separate from AdminInstructorsController, which
// only handles the instructor-application approval queue. Listing is open to
// Admin and SuperAdmin (consistent with the rest of the admin area); deleting
// is SuperAdmin-only, since permanently removing an account is the single
// most destructive action available here.
[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
public class AdminUsersController(AppDbContext db, UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AdminUserDto>>> List([FromQuery] string? search)
    {
        var query = db.Users.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u => u.Name.Contains(term) || (u.Email != null && u.Email.Contains(term)));
        }

        var users = await query.OrderByDescending(u => u.JoinedDate).Take(200).ToListAsync();
        var roleRows = await db.UserRoles
            .Join(db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name })
            .ToListAsync();
        var rolesByUser = roleRows.GroupBy(r => r.UserId).ToDictionary(g => g.Key, g => g.First().RoleName ?? Roles.Student);

        return users.Select(u => new AdminUserDto(
            u.Id, u.Name, u.Email ?? string.Empty,
            rolesByUser.TryGetValue(u.Id, out var role) ? role! : Roles.Student,
            u.JoinedDate
        )).ToList();
    }

    [HttpDelete("{userId:guid}")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public async Task<IActionResult> Delete(Guid userId)
    {
        if (userId == User.GetUserId())
            return BadRequest(new { message = "You can't delete your own account from here — use Settings instead." });

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return NotFound();

        if (await userManager.IsInRoleAsync(user, Roles.SuperAdmin))
            return BadRequest(new { message = "SuperAdmin accounts can't be deleted here." });

        var hasCourses = await db.Courses.AnyAsync(c => c.InstructorId == userId);
        if (hasCourses)
        {
            return BadRequest(new
            {
                message = "This user still has published courses. Delete or transfer them before removing the account."
            });
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join(" ", result.Errors.Select(e => e.Description)) });

        return NoContent();
    }
}
