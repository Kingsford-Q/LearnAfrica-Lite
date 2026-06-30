namespace LearnAfricaLite.Api.Models;

public class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public Guid SectionId { get; set; }
    public Section? Section { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public string? VideoFile { get; set; }
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }

    public ICollection<Resource> Resources { get; set; } = new List<Resource>();
    public ICollection<LessonProgress> Progresses { get; set; } = new List<LessonProgress>();
    public ICollection<ForumThread> ForumThreads { get; set; } = new List<ForumThread>();
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
