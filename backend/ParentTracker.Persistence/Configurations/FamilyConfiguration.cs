using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class FamilyConfiguration : IEntityTypeConfiguration<Family>
{
    public void Configure(EntityTypeBuilder<Family> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(100);
        builder.Property(f => f.FamilyCode).IsRequired().HasMaxLength(20);
        builder.HasIndex(f => f.FamilyCode).IsUnique();

        builder.HasOne(f => f.OwnerParent)
            .WithMany()
            .HasForeignKey(f => f.OwnerParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(f => f.Members)
            .WithOne(m => m.Family)
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(f => f.Children)
            .WithOne(c => c.Family)
            .HasForeignKey(c => c.FamilyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
