using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParentTracker.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRejectedByUserIdToRewardRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "rejected_by_user_id",
                table: "reward_requests",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rejected_by_user_id",
                table: "reward_requests");
        }
    }
}
