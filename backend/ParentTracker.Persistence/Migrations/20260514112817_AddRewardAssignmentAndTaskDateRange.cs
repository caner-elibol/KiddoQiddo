using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParentTracker.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRewardAssignmentAndTaskDateRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "end_date",
                table: "tasks",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "start_date",
                table: "tasks",
                type: "date",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "reward_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    reward_id = table.Column<Guid>(type: "uuid", nullable: false),
                    child_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reward_assignments", x => x.id);
                    table.ForeignKey(
                        name: "fk_reward_assignments_children_child_id",
                        column: x => x.child_id,
                        principalTable: "children",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_reward_assignments_rewards_reward_id",
                        column: x => x.reward_id,
                        principalTable: "rewards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_reward_assignments_child_id",
                table: "reward_assignments",
                column: "child_id");

            migrationBuilder.CreateIndex(
                name: "ix_reward_assignments_reward_id_child_id",
                table: "reward_assignments",
                columns: new[] { "reward_id", "child_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reward_assignments");

            migrationBuilder.DropColumn(
                name: "end_date",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "start_date",
                table: "tasks");
        }
    }
}
