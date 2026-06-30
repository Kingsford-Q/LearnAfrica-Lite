namespace LearnAfricaLite.Api.Models;

public class Certificate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public string Grade { get; set; } = "Passed";
    public string VerificationCode { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
