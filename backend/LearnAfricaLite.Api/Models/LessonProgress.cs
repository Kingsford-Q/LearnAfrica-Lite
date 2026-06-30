namespace LearnAfricaLite.Api.Models;

public class LessonProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public Guid LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public bool IsCompleted { get; set; }
    public int? QuizScore { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
}
