using System.ComponentModel.DataAnnotations;
using LearnAfricaLite.Api.Models;

namespace LearnAfricaLite.Api.DTOs;

public record CourseSummaryDto(
    Guid Id,
    string Title,
    string Description,
    Guid InstructorId,
    string InstructorName,
    string? InstructorAvatar,
    string? Thumbnail,
    string Category,
    string Difficulty,
    string Duration,
    string Language,
    decimal Price,
    bool IsFree,
    string[] Tags,
    bool HasCertificate,
    bool HasLifetimeAccess,
    bool HasResources,
    string Status,
    int Enrollments,
    double Rating,
    int ReviewCount,
    DateTime CreatedAt
);

public record CourseDetailDto(
    Guid Id,
    string Title,
    string Description,
    Guid InstructorId,
    string InstructorName,
    string? InstructorAvatar,
    string? Thumbnail,
    string Category,
    string Difficulty,
    string Duration,
    string Language,
    decimal Price,
    bool IsFree,
    string? PaymentLink,
    string[] Tags,
    string[] LearningOutcomes,
    bool HasCertificate,
    bool HasLifetimeAccess,
    bool HasResources,
    string Status,
    int Enrollments,
    double Rating,
    int ReviewCount,
    DateTime CreatedAt,
    List<SectionDto> Sections
);

public record SectionDto(Guid Id, string Title, int Order, List<LessonSummaryDto> Lessons, List<QuizSummaryDto> Quizzes);

public record LessonSummaryDto(Guid Id, string Title, string Description, string Duration, int Order, bool HasVideo, bool IsCompleted);

public record LessonDetailDto(
    Guid Id,
    Guid CourseId,
    Guid SectionId,
    string Title,
    string Description,
    string Duration,
    string? VideoUrl,
    string? VideoFile,
    string Content,
    int Order,
    List<ResourceDto> Resources,
    bool IsCompleted,
    int? QuizScore
);

public record ResourceDto(Guid Id, string Title, string Url, string Type);

public record QuizSummaryDto(Guid Id, string Title, int DurationSeconds, int Order, Guid? LessonId, int QuestionCount);

public record QuizDetailDto(Guid Id, Guid CourseId, string Title, int DurationSeconds, List<QuizQuestionDto> Questions);

public record QuizQuestionDto(Guid Id, string Text, string? ImageUrl, List<QuizOptionDto> Options);

// For taking a quiz — correctness withheld until submission.
public record QuizOptionDto(Guid Id, string Text);

public record CreateCourseRequest(
    [Required] string Title,
    [Required] string Description,
    [Required] string Category,
    [Required] string Difficulty,
    string Duration,
    string Language,
    decimal Price,
    bool IsFree,
    string? PaymentLink,
    string[]? Tags,
    string[]? LearningOutcomes,
    bool HasCertificate,
    bool HasLifetimeAccess,
    bool HasResources,
    string? Thumbnail
);

public record UpdateCourseRequest(
    string? Title,
    string? Description,
    string? Category,
    string? Difficulty,
    string? Duration,
    string? Language,
    decimal? Price,
    bool? IsFree,
    string? PaymentLink,
    string[]? Tags,
    string[]? LearningOutcomes,
    bool? HasCertificate,
    bool? HasLifetimeAccess,
    bool? HasResources,
    string? Thumbnail,
    CourseStatus? Status
);

public record CreateSectionRequest([Required] string Title, int Order);
public record UpdateSectionRequest(string? Title, int? Order);

public record CreateLessonRequest(
    [Required] string Title,
    string? Description,
    string? Duration,
    string? VideoUrl,
    string? VideoFile,
    string? Content,
    int Order
);
public record UpdateLessonRequest(
    string? Title,
    string? Description,
    string? Duration,
    string? VideoUrl,
    string? VideoFile,
    string? Content,
    int? Order
);

public record CreateResourceRequest([Required] string Title, [Required] string Url, ResourceType Type);

public record CreateQuizRequest(
    [Required] string Title,
    int DurationSeconds,
    int Order,
    Guid? LessonId,
    List<CreateQuizQuestionRequest> Questions
);
public record CreateQuizQuestionRequest(
    [Required] string Text,
    string? ImageUrl,
    int Order,
    [Required, MinLength(2)] List<CreateQuizOptionRequest> Options
);
public record CreateQuizOptionRequest([Required] string Text, bool IsCorrect, int Order);

public record UpdateQuizRequest(
    [Required] string Title,
    int DurationSeconds,
    int Order,
    List<CreateQuizQuestionRequest> Questions
);

public record SubmitQuizAttemptRequest(List<QuizAnswerRequest> Answers);
public record QuizAnswerRequest(Guid QuestionId, Guid SelectedOptionId);

public record QuizResultDto(int Score, int CorrectCount, int TotalQuestions, List<QuizAnswerResultDto> Answers);
public record QuizAnswerResultDto(Guid QuestionId, Guid SelectedOptionId, Guid CorrectOptionId, bool IsCorrect);

public record InstructorStatsDto(
    int TotalCourses,
    int TotalStudents,
    decimal TotalEarnings,
    double AverageRating,
    int CompletionRate,
    List<MonthlyEnrollmentDto> MonthlyEnrollments,
    List<MonthlyRevenueDto> MonthlyRevenue,
    List<CoursePerformanceDto> CoursePerformance,
    List<RecentStudentDto> RecentStudents,
    CompletionBreakdownDto CompletionBreakdown,
    List<WeeklyActivityDto> WeeklyActivity
);
public record MonthlyEnrollmentDto(string Month, int Enrollments);
public record MonthlyRevenueDto(string Month, decimal Revenue);
public record CoursePerformanceDto(string Name, int Students, int Completion, double Rating, decimal Revenue);
public record RecentStudentDto(Guid UserId, string Name, string Course, DateTime EnrolledAt, int Progress);
public record CompletionBreakdownDto(int Completed, int InProgress, int NotStarted);
public record WeeklyActivityDto(string Day, int Enrollments, int LessonCompletions);
