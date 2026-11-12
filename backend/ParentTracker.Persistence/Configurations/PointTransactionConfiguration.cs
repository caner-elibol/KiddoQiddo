using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class PointTransactionConfiguration : IEntityTypeConfiguration<PointTransaction>
{
    public void Configure(EntityTypeBuilder<PointTransaction> builder)
    {
        builder.HasKey(pt => pt.Id);
        builder.Property(pt => pt.SourceType).HasConversion<string>();
        builder.Property(pt => pt.Description).IsRequired().HasMaxLength(255);

        builder.HasIndex(pt => new { pt.ChildId, pt.CreatedAt });
    }
}
