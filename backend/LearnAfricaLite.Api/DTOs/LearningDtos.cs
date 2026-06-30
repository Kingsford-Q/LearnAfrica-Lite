namespace LearnAfricaLite.Api.DTOs;

public record EnrollmentDto(Guid CourseId, int ProgressPercent, DateTime EnrolledAt, DateTime? CompletedAt);

public record ReviewDto(Guid Id, Guid CourseId, Guid UserId, string UserName, string? UserAvatar, int Rating, string Comment, DateTime CreatedAt);

public record CreateReviewRequest(int Rating, string Comment);

public record CertificateDto(Guid Id, Guid CourseId, string CourseTitle, string InstructorName, Guid UserId, string UserName, string Grade, string VerificationCode, DateTime IssuedAt);

public record CertificateVerificationDto(bool Valid, CertificateDto? Certificate);
