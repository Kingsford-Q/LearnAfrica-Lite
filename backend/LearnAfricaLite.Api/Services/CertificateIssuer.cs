using LearnAfricaLite.Api.Controllers;
using LearnAfricaLite.Api.Data;
using LearnAfricaLite.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Services;

public static class CertificateIssuer
{
    public static async Task IssueIfEligibleAsync(AppDbContext db, Guid userId, Guid courseId)
    {
        var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course is null || !course.HasCertificate) return;

        var alreadyIssued = await db.Certificates.AnyAsync(c => c.UserId == userId && c.CourseId == courseId);
        if (alreadyIssued) return;

        db.Certificates.Add(new Certificate
        {
            CourseId = courseId,
            UserId = userId,
            Grade = "Passed",
            VerificationCode = GenerateCode(),
        });

        await AuthController.NotifyAsync(db, userId, NotificationType.Achievement,
            "Certificate issued", $"Your certificate for \"{course.Title}\" is ready.", $"certificate_{userId}_{courseId}");
    }

    private static string GenerateCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
        var rng = Random.Shared;
        string Block() => new(Enumerable.Range(0, 4).Select(_ => chars[rng.Next(chars.Length)]).ToArray());
        return $"LA-CERT-{Block()}-{Block()}";
    }
}
