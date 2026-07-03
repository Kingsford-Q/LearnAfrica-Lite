using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/certificates")]
public class CertificatesController(AppDbContext db) : ControllerBase
{
    private static IQueryable<DTOs.CertificateDto> Project(IQueryable<Models.Certificate> query) => query
        .Include(c => c.Course).ThenInclude(co => co!.Instructor)
        .Include(c => c.User)
        .Select(c => new DTOs.CertificateDto(
            c.Id, c.CourseId, c.Course!.Title, c.Course.Instructor!.Name,
            c.UserId, c.User!.Name, c.Grade, c.VerificationCode, c.IssuedAt));

    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<List<CertificateDto>>> Mine()
    {
        var userId = User.GetUserId();
        // Order on the raw entity before projecting -- ordering on a column of the
        // already-projected DTO caused query translation to blow up in production
        // (500 with no response body) even though the equivalent single-row queries
        // below using the same Project() helper worked fine.
        var certs = await Project(db.Certificates.AsNoTracking()
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.IssuedAt))
            .ToListAsync();
        return certs;
    }

    [HttpGet("course/{courseId:guid}")]
    [Authorize]
    public async Task<ActionResult<CertificateDto>> ForCourse(Guid courseId)
    {
        var userId = User.GetUserId();
        var cert = await Project(db.Certificates.AsNoTracking()
            .Where(c => c.UserId == userId && c.CourseId == courseId))
            .FirstOrDefaultAsync();

        return cert is null ? NotFound() : cert;
    }

    [HttpGet("verify/{code}")]
    [AllowAnonymous]
    public async Task<ActionResult<CertificateVerificationDto>> Verify(string code)
    {
        var normalized = code.Trim().ToUpperInvariant();
        var cert = await Project(db.Certificates.AsNoTracking()
            .Where(c => c.VerificationCode == normalized))
            .FirstOrDefaultAsync();

        return new CertificateVerificationDto(cert is not null, cert);
    }
}
