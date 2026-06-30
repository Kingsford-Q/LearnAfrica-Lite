using LearnAfricaLite.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LearnAfricaLite.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizOption> QuizOptions => Set<QuizOption>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ForumThread> ForumThreads => Set<ForumThread>();
    public DbSet<ForumReply> ForumReplies => Set<ForumReply>();
    public DbSet<BadgeDefinition> BadgeDefinitions => Set<BadgeDefinition>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Course>(e =>
        {
            e.HasOne(c => c.Instructor)
                .WithMany(u => u.Courses)
                .HasForeignKey(c => c.InstructorId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(c => c.Sections)
                .WithOne(s => s.Course)
                .HasForeignKey(s => s.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(c => c.Price).HasPrecision(10, 2);
        });

        builder.Entity<Lesson>(e =>
        {
            e.HasOne(l => l.Section)
                .WithMany(s => s.Lessons)
                .HasForeignKey(l => l.SectionId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(l => l.Course)
                .WithMany()
                .HasForeignKey(l => l.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Resource>(e =>
        {
            e.HasOne(r => r.Lesson)
                .WithMany(l => l.Resources)
                .HasForeignKey(r => r.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Quiz>(e =>
        {
            e.HasOne(q => q.Section)
                .WithMany(s => s.Quizzes)
                .HasForeignKey(q => q.SectionId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(q => q.Course)
                .WithMany()
                .HasForeignKey(q => q.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(q => q.Lesson)
                .WithMany(l => l.Quizzes)
                .HasForeignKey(q => q.LessonId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<QuizQuestion>(e =>
        {
            e.HasOne(q => q.Quiz)
                .WithMany(qz => qz.Questions)
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<QuizOption>(e =>
        {
            e.HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Enrollment>(e =>
        {
            e.HasIndex(en => new { en.UserId, en.CourseId }).IsUnique();

            e.HasOne(en => en.User)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(en => en.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(en => en.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(en => en.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<LessonProgress>(e =>
        {
            e.HasIndex(lp => new { lp.UserId, lp.LessonId }).IsUnique();

            e.HasOne(lp => lp.User)
                .WithMany(u => u.LessonProgresses)
                .HasForeignKey(lp => lp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(lp => lp.Lesson)
                .WithMany(l => l.Progresses)
                .HasForeignKey(lp => lp.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Review>(e =>
        {
            e.HasOne(r => r.Course)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Certificate>(e =>
        {
            e.HasIndex(c => c.VerificationCode).IsUnique();
            e.HasIndex(c => new { c.UserId, c.CourseId }).IsUnique();

            e.HasOne(c => c.Course)
                .WithMany(co => co.Certificates)
                .HasForeignKey(c => c.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Notification>(e =>
        {
            e.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ForumThread>(e =>
        {
            e.HasOne(t => t.Lesson)
                .WithMany(l => l.ForumThreads)
                .HasForeignKey(t => t.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ForumReply>(e =>
        {
            e.HasOne(r => r.Thread)
                .WithMany(t => t.Replies)
                .HasForeignKey(r => r.ThreadId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<UserBadge>(e =>
        {
            e.HasIndex(ub => new { ub.UserId, ub.BadgeDefinitionId }).IsUnique();

            e.HasOne(ub => ub.User)
                .WithMany(u => u.Badges)
                .HasForeignKey(ub => ub.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ub => ub.BadgeDefinition)
                .WithMany(b => b.UserBadges)
                .HasForeignKey(ub => ub.BadgeDefinitionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BadgeDefinition>(e =>
        {
            e.HasIndex(b => b.Key).IsUnique();
        });

        builder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(rt => rt.TokenHash).IsUnique();

            e.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
