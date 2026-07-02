using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnAfricaLite.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixForumUserCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ForumReplies_AspNetUsers_UserId",
                table: "ForumReplies");

            migrationBuilder.DropForeignKey(
                name: "FK_ForumThreads_AspNetUsers_UserId",
                table: "ForumThreads");

            migrationBuilder.AddForeignKey(
                name: "FK_ForumReplies_AspNetUsers_UserId",
                table: "ForumReplies",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ForumThreads_AspNetUsers_UserId",
                table: "ForumThreads",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ForumReplies_AspNetUsers_UserId",
                table: "ForumReplies");

            migrationBuilder.DropForeignKey(
                name: "FK_ForumThreads_AspNetUsers_UserId",
                table: "ForumThreads");

            migrationBuilder.AddForeignKey(
                name: "FK_ForumReplies_AspNetUsers_UserId",
                table: "ForumReplies",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ForumThreads_AspNetUsers_UserId",
                table: "ForumThreads",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
