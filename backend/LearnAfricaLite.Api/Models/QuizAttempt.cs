namespace LearnAfricaLite.Api.Models;

public class QuizAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public Guid QuizId { get; set; }
    public Quiz? Quiz { get; set; }

    public int Score { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
