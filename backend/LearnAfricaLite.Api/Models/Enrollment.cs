namespace LearnAfricaLite.Api.Models;

public class Enrollment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public int ProgressPercent { get; set; }
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
