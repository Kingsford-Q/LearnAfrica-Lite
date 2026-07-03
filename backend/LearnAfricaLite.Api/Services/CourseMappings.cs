using LearnAfricaLite.Api.DTOs;
using LearnAfricaLite.Api.Models;

namespace LearnAfricaLite.Api.Services;

public static class CourseMappings
{
    public static CourseSummaryDto ToSummaryDto(this Course c)
    {
        var reviewCount = c.Reviews.Count;
        var rating = reviewCount > 0 ? Math.Round(c.Reviews.Average(r => r.Rating), 1) : 0;

        return new CourseSummaryDto(
            c.Id, c.Title, c.Description, c.InstructorId,
            c.Instructor?.Name ?? string.Empty, c.Instructor?.Avatar,
            c.Thumbnail, c.Category, c.Difficulty, c.Duration, c.Language,
            c.Price, c.IsFree, c.Tags, c.HasCertificate, c.HasLifetimeAccess, c.HasResources,
            c.Status.ToString(), c.Enrollments.Count, rating, reviewCount, c.CreatedAt
        );
    }

    public static CourseDetailDto ToDetailDto(this Course c, ISet<Guid>? completedLessonIds = null)
    {
        var reviewCount = c.Reviews.Count;
        var rating = reviewCount > 0 ? Math.Round(c.Reviews.Average(r => r.Rating), 1) : 0;

        return new CourseDetailDto(
            c.Id, c.Title, c.Description, c.InstructorId,
            c.Instructor?.Name ?? string.Empty, c.Instructor?.Avatar,
            c.Thumbnail, c.Category, c.Difficulty, c.Duration, c.Language,
            c.Price, c.IsFree, c.PaymentLink, c.Tags, c.LearningOutcomes,
            c.HasCertificate, c.HasLifetimeAccess, c.HasResources,
            c.Status.ToString(), c.Enrollments.Count, rating, reviewCount, c.CreatedAt,
            c.Sections.OrderBy(s => s.Order).Select(s => s.ToDto(completedLessonIds)).ToList()
        );
    }

    public static SectionDto ToDto(this Section s, ISet<Guid>? completedLessonIds = null) => new(
        s.Id, s.Title, s.Order,
        s.Lessons.OrderBy(l => l.Order).Select(l => l.ToSummaryDto(completedLessonIds?.Contains(l.Id) ?? false)).ToList(),
        s.Quizzes.OrderBy(q => q.Order).Select(q => q.ToSummaryDto()).ToList()
    );

    public static LessonSummaryDto ToSummaryDto(this Lesson l, bool isCompleted = false) => new(
        l.Id, l.Title, l.Description, l.Duration, l.Order,
        !string.IsNullOrEmpty(l.VideoUrl) || !string.IsNullOrEmpty(l.VideoFile), isCompleted
    );

    public static LessonDetailDto ToDetailDto(this Lesson l, bool isCompleted, int? quizScore) => new(
        l.Id, l.CourseId, l.SectionId, l.Title, l.Description, l.Duration,
        l.VideoUrl, l.VideoFile, l.Content, l.Order,
        l.Resources.Select(r => r.ToDto()).ToList(),
        isCompleted, quizScore
    );

    public static ResourceDto ToDto(this Resource r) => new(r.Id, r.Title, r.Url, r.Type.ToString().ToLowerInvariant());

    public static QuizSummaryDto ToSummaryDto(this Quiz q) => new(q.Id, q.Title, q.DurationSeconds, q.Order, q.LessonId, q.Questions.Count);

    // includeAnswers must stay false for students taking the quiz — true is only
    // for the instructor/staff editor view, which needs to see the correct answer.
    public static QuizDetailDto ToDetailDto(this Quiz q, bool includeAnswers = false) => new(
        q.Id, q.CourseId, q.Title, q.DurationSeconds,
        q.Questions.OrderBy(qq => qq.Order).Select(qq => new QuizQuestionDto(
            qq.Id, qq.Text, qq.ImageUrl,
            qq.Options.OrderBy(o => o.Order)
                .Select(o => new QuizOptionDto(o.Id, o.Text, includeAnswers ? o.IsCorrect : null)).ToList()
        )).ToList()
    );
}
