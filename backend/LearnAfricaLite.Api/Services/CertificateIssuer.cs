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
        if (course is null) return;

        var alreadyIssued = await db.Certificates.AnyAsync(c => c.UserId == userId && c.CourseId == courseId);
        if (alreadyIssued) return;

        db.Certificates.Add(new Certificate
        {
            CourseId = courseId,
            UserId = userId,
            Grade = await ComputeGradeAsync(db, userId, courseId),
            VerificationCode = GenerateCode(),
        });

        await AuthController.NotifyAsync(db, userId, NotificationType.Achievement,
            "Certificate issued", $"Your certificate for \"{course.Title}\" is ready.", $"certificate_{userId}_{courseId}",
            $"/certificate/{courseId}");
    }

    private static async Task<string> ComputeGradeAsync(AppDbContext db, Guid userId, Guid courseId)
    {
        var quizIds = await db.Quizzes.Where(q => q.CourseId == courseId).Select(q => q.Id).ToListAsync();
        if (quizIds.Count == 0) return "Completed";

        var scores = await db.QuizAttempts
            .Where(a => a.UserId == userId && quizIds.Contains(a.QuizId))
            .Select(a => a.Score)
            .ToListAsync();
        if (scores.Count == 0) return "Completed";

        var average = scores.Average();
        return average switch
        {
            >= 90 => "Distinction",
            >= 80 => "Merit",
            >= 70 => "Passed",
            _ => "Completed",
        };
    }

    private static string GenerateCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
        var rng = Random.Shared;
        string Block() => new(Enumerable.Range(0, 4).Select(_ => chars[rng.Next(chars.Length)]).ToArray());
        return $"LA-CERT-{Block()}-{Block()}";
    }
}
