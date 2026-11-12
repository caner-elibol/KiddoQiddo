using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class ChildTaskConfiguration : IEntityTypeConfiguration<ChildTask>
{
    public void Configure(EntityTypeBuilder<ChildTask> builder)
    {
        builder.HasKey(ct => ct.Id);
        builder.Property(ct => ct.Status).HasConversion<string>();
        builder.Property(ct => ct.ParentNote).HasMaxLength(500);

        builder.HasIndex(ct => new { ct.ChildId, ct.ScheduledDate });
    }
}
