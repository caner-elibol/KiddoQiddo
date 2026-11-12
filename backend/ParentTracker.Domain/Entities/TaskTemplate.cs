namespace ParentTracker.Domain.Entities;

public class TaskTemplate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public int DefaultPoints { get; set; }
    public int? SuggestedAgeMin { get; set; }
    public int? SuggestedAgeMax { get; set; }
    public bool IsActive { get; set; } = true;
}
