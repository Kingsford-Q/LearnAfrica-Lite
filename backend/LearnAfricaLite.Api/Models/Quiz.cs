namespace LearnAfricaLite.Api.Models;

public class Quiz
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public Guid SectionId { get; set; }
    public Section? Section { get; set; }

    // Optional: the lesson this quiz follows
    public Guid? LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public string Title { get; set; } = string.Empty;
    public int DurationSeconds { get; set; } = 180;
    public int Order { get; set; }

    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
}
