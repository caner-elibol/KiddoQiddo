using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class RewardAssignmentConfiguration : IEntityTypeConfiguration<RewardAssignment>
{
    public void Configure(EntityTypeBuilder<RewardAssignment> builder)
    {
        builder.HasKey(ra => ra.Id);

        builder.HasOne(ra => ra.Reward)
            .WithMany(r => r.Assignments)
            .HasForeignKey(ra => ra.RewardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ra => ra.Child)
            .WithMany()
            .HasForeignKey(ra => ra.ChildId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(ra => new { ra.RewardId, ra.ChildId }).IsUnique();
    }
}
