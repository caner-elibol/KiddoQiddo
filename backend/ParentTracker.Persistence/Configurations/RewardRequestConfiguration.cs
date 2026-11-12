using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class RewardRequestConfiguration : IEntityTypeConfiguration<RewardRequest>
{
    public void Configure(EntityTypeBuilder<RewardRequest> builder)
    {
        builder.HasKey(rr => rr.Id);
        builder.Property(rr => rr.Status).HasConversion<string>();
        builder.Property(rr => rr.Note).HasMaxLength(500);
    }
}
