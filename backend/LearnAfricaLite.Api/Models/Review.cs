namespace LearnAfricaLite.Api.Models;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
