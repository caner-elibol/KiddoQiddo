using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Title).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Category).IsRequired().HasMaxLength(50);
        builder.Property(t => t.RepeatType).HasConversion<string>();

        builder.HasOne(t => t.Family)
            .WithMany()
            .HasForeignKey(t => t.FamilyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Parent)
            .WithMany()
            .HasForeignKey(t => t.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.Assignments)
            .WithOne(a => a.TaskItem)
            .HasForeignKey(a => a.TaskItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.ChildTasks)
            .WithOne(ct => ct.TaskItem)
            .HasForeignKey(ct => ct.TaskItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
