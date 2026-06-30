namespace LearnAfricaLite.Api.Models;

public class ForumThread
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ForumReply> Replies { get; set; } = new List<ForumReply>();
}
