using ParentTracker.Domain.Entities;
using ParentTracker.Domain.Enums;

namespace ParentTracker.Application.Common.Interfaces;

public interface IPointService
{
    Task<PointTransaction> AwardPoints(
        Guid childId,
        int points,
        PointSourceType sourceType,
        Guid? sourceId,
        string description,
        CancellationToken ct = default);

    Task<PointTransaction> DeductPoints(
        Guid childId,
        int points,
        PointSourceType sourceType,
        Guid? sourceId,
        string description,
        CancellationToken ct = default);
}
