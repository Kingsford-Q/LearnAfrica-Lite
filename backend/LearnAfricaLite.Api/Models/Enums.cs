namespace LearnAfricaLite.Api.Models;

public static class Roles
{
    public const string Student = "Student";
    public const string Instructor = "Instructor";
    public const string Admin = "Admin";
    public const string SuperAdmin = "SuperAdmin";

    public static readonly string[] All = [Student, Instructor, Admin, SuperAdmin];
}

public enum InstructorApprovalStatus
{
    None = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public enum CourseStatus
{
    Draft = 0,
    Published = 1
}

public enum ResourceType
{
    Link = 0,
    Image = 1,
    File = 2
}

public enum NotificationType
{
    System = 0,
    Course = 1,
    Achievement = 2,
    Reminder = 3,
    Enrollment = 4,
    Community = 5,
    Security = 6,
    Info = 7,
    Announcement = 8
}
