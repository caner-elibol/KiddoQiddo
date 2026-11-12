using Microsoft.EntityFrameworkCore;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Family> Families { get; }
    DbSet<FamilyMember> FamilyMembers { get; }
    DbSet<Child> Children { get; }
    DbSet<TaskTemplate> TaskTemplates { get; }
    DbSet<TaskItem> Tasks { get; }
    DbSet<TaskAssignment> TaskAssignments { get; }
    DbSet<ChildTask> ChildTasks { get; }
    DbSet<Reward> Rewards { get; }
    DbSet<RewardRequest> RewardRequests { get; }
    DbSet<RewardAssignment> RewardAssignments { get; }
    DbSet<PointTransaction> PointTransactions { get; }
    DbSet<InAppNotification> InAppNotifications { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
