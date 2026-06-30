namespace LearnAfricaLite.Api.Models;

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public Guid InstructorId { get; set; }
    public ApplicationUser? Instructor { get; set; }

    public string? Thumbnail { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Language { get; set; } = "English";

    public decimal Price { get; set; }
    public bool IsFree { get; set; } = true;
    public string? PaymentLink { get; set; }

    public string[] Tags { get; set; } = [];
    public string[] LearningOutcomes { get; set; } = [];

    public bool HasCertificate { get; set; }
    public bool HasLifetimeAccess { get; set; } = true;
    public bool HasResources { get; set; }

    public CourseStatus Status { get; set; } = CourseStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
}
