using Microsoft.EntityFrameworkCore;
using ParentTracker.Application.Common.Interfaces;
using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Infrastructure.Services;

public class PointService : IPointService
{
    private readonly IApplicationDbContext _db;

    public PointService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PointTransaction> AwardPoints(Guid childId, int points, PointSourceType sourceType, Guid? sourceId, string description, CancellationToken ct = default)
    {
        var child = await _db.Children.FindAsync([childId], ct)
            ?? throw new InvalidOperationException($"Child {childId} not found.");

        child.TotalPoints += points;
        child.TotalLifetimePoints += points;

        var transaction = new PointTransaction
        {
            ChildId = childId,
            Points = points,
            SourceType = sourceType,
            SourceId = sourceId,
            Description = description,
            BalanceAfter = child.TotalPoints
        };

        _db.PointTransactions.Add(transaction);
        await _db.SaveChangesAsync(ct);

        return transaction;
    }

    public async Task<PointTransaction> DeductPoints(Guid childId, int points, PointSourceType sourceType, Guid? sourceId, string description, CancellationToken ct = default)
    {
        var child = await _db.Children.FindAsync([childId], ct)
            ?? throw new InvalidOperationException($"Child {childId} not found.");

        if (child.TotalPoints < points)
            throw new InvalidOperationException("Insufficient points.");

        child.TotalPoints -= points;

        var transaction = new PointTransaction
        {
            ChildId = childId,
            Points = -points,
            SourceType = sourceType,
            SourceId = sourceId,
            Description = description,
            BalanceAfter = child.TotalPoints
        };

        _db.PointTransactions.Add(transaction);
        await _db.SaveChangesAsync(ct);

        return transaction;
    }
}
