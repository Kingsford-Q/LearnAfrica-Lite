namespace LearnAfricaLite.Api.Models;

public class UserBadge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public Guid BadgeDefinitionId { get; set; }
    public BadgeDefinition? BadgeDefinition { get; set; }

    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
}
