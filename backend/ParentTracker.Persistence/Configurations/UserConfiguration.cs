using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ParentTracker.Domain.Entities;

namespace ParentTracker.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.FullName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Email).IsRequired(false).HasMaxLength(255);
        builder.Property(u => u.Phone).IsRequired(false).HasMaxLength(30);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
        builder.Property(u => u.Role).HasConversion<string>();

        builder.HasIndex(u => u.Email).IsUnique().HasFilter("\"email\" IS NOT NULL");
    }
}
