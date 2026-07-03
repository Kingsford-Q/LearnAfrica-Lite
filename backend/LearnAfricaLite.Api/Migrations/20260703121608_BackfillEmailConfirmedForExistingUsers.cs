using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnAfricaLite.Api.Migrations
{
    /// <inheritdoc />
    public partial class BackfillEmailConfirmedForExistingUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Email verification is new -- every account that already exists
            // signed up before it was possible to confirm anything, so grandfather
            // them all in rather than locking real users out of a flow that never
            // applied to them when they registered.
            migrationBuilder.Sql("UPDATE \"AspNetUsers\" SET \"EmailConfirmed\" = TRUE WHERE \"EmailConfirmed\" = FALSE;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
