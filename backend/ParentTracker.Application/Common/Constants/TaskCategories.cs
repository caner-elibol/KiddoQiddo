namespace ParentTracker.Application.Common.Constants;

public static class TaskCategories
{
    public static readonly string[] All =
    [
        "Okul",
        "Sağlık",
        "Ev düzeni",
        "Kişisel bakım",
        "Spor",
        "Okuma",
        "Uyku",
        "Aile"
    ];

    public static bool IsValid(string category) => All.Contains(category);
}
