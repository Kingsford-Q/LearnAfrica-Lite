namespace LearnAfricaLite.Api.Models;

public class Resource
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public ResourceType Type { get; set; } = ResourceType.Link;
}
