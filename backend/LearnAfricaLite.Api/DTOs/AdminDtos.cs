namespace LearnAfricaLite.Api.DTOs;

public record InstructorApplicationDto(
    Guid UserId,
    string Name,
    string Email,
    string? Avatar,
    string? Bio,
    string? InstructorTitle,
    string? InstructorPortfolio,
    string[] InstructorSkills,
    string InstructorApprovalStatus,
    DateTime? InstructorAppliedAt,
    DateTime? InstructorReviewedAt,
    string? InstructorRejectionReason
);

public record RejectInstructorRequest(string Reason);
