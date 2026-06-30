namespace LearnAfricaLite.Api.Models;

public class BadgeDefinition
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconName { get; set; } = string.Empty;
    public string RequirementType { get; set; } = string.Empty;
    public int Goal { get; set; }
    public string Color { get; set; } = string.Empty;

    public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}
