namespace LearnAfricaLite.Api.Models;

public class QuizQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuizId { get; set; }
    public Quiz? Quiz { get; set; }

    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Order { get; set; }

    public ICollection<QuizOption> Options { get; set; } = new List<QuizOption>();
}
