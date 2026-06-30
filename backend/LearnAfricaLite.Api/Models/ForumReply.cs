namespace LearnAfricaLite.Api.Models;

public class ForumReply
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ThreadId { get; set; }
    public ForumThread? Thread { get; set; }

    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
