namespace ParentTracker.Application.Common.Constants;

public static class LevelThresholds
{
    public static readonly Dictionary<int, int> Thresholds = new()
    {
        { 1, 0 },
        { 2, 50 },
        { 3, 150 },
        { 4, 300 },
        { 5, 500 },
        { 6, 750 },
        { 7, 1050 },
        { 8, 1400 },
        { 9, 1800 },
        { 10, 2300 }
    };

    public static int CalculateLevel(int totalLifetimePoints)
    {
        return Thresholds
            .Where(kv => totalLifetimePoints >= kv.Value)
            .Max(kv => kv.Key);
    }

    public static int PointsForNextLevel(int currentLevel)
    {
        return Thresholds.TryGetValue(currentLevel + 1, out var pts) ? pts : int.MaxValue;
    }

    public static double LevelProgressPercent(int totalLifetimePoints, int currentLevel)
    {
        var current = Thresholds[currentLevel];
        var next = PointsForNextLevel(currentLevel);
        if (next == int.MaxValue) return 100.0;
        var range = next - current;
        var progress = totalLifetimePoints - current;
        return Math.Clamp((double)progress / range * 100, 0, 100);
    }
}
