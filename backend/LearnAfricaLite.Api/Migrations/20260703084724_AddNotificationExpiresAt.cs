using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnAfricaLite.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationExpiresAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "Notifications",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "Notifications");
        }
    }
}
