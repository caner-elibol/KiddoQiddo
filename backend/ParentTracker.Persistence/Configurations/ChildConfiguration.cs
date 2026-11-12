using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class ChildConfiguration : IEntityTypeConfiguration<Child>
{
    public void Configure(EntityTypeBuilder<Child> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(50);
        builder.Property(c => c.AvatarKey).IsRequired().HasMaxLength(50);
        builder.Property(c => c.PinCodeHash).IsRequired().HasMaxLength(255);

        builder.HasOne(c => c.Parent)
            .WithMany()
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.ChildTasks)
            .WithOne(ct => ct.Child)
            .HasForeignKey(ct => ct.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.RewardRequests)
            .WithOne(rr => rr.Child)
            .HasForeignKey(rr => rr.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.PointTransactions)
            .WithOne(pt => pt.Child)
            .HasForeignKey(pt => pt.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.RefreshTokens)
            .WithOne(rt => rt.Child)
            .HasForeignKey(rt => rt.ChildId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
