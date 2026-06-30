namespace LearnAfricaLite.Api.Models;

public class Section
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
