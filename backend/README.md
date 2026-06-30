# LearnAfrica Lite — Backend

ASP.NET Core 10 Web API (`LearnAfricaLite.Api`) — EF Core + PostgreSQL (Supabase in production), ASP.NET Core Identity, JWT auth with rotating refresh-token cookies.

## Local development

The app reads `ConnectionStrings:Default` from configuration, with `DATABASE_URL` (if set) taking priority. For local dev, put your real connection string in a gitignored `appsettings.Development.local.json` next to `appsettings.json` — never commit real credentials:

```json
{
  "ConnectionStrings": {
    "Default": "Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require"
  }
}
```

Then:

```
cd backend/LearnAfricaLite.Api
dotnet ef database update
dotnet run
```

The API listens on `http://localhost:5080` by default and applies pending migrations automatically on startup. A bootstrap SuperAdmin account and the static badge definitions are seeded the first time it connects to an empty database (see `Data/DbSeeder.cs`). No course, instructor, or review content is ever seeded — that's created live through the app.

Alternatively, `docker compose up -d` (from `backend/`) starts a local Postgres container if you'd rather not point local dev at the hosted database.

## Deploying

**Database — Supabase.** Use the Session Pooler connection (works correctly with a long-running server process, unlike the Transaction Pooler). Find it under Project Settings → Database → Connection string in the Supabase dashboard.

**Backend — Render.** This project includes `LearnAfricaLite.Api/Dockerfile`. Create a Render Web Service from this repo with:

- Root directory: `backend/LearnAfricaLite.Api`
- Environment: Docker (uses the included `Dockerfile`)
- Render sets `PORT` automatically — the Dockerfile's entrypoint binds to it.

Required environment variables on Render:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Npgsql keyword=value string, e.g. `Host=aws-0-<region>.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=<db-password>;SSL Mode=Require`. (A `postgres://` URI also works, but the keyword=value form sidesteps URL-encoding the password.) |
| `Jwt__Secret` | A fresh base64-encoded random secret — **do not reuse the value committed in `appsettings.json`**, that one is a dev-only placeholder. Generate with `openssl rand -base64 48`. |
| `Cors__AllowedOrigins__0` | Your deployed Vercel frontend URL, e.g. `https://learnafrica-lite.vercel.app` |
| `SeedSuperAdmin__Email` | The real SuperAdmin email to bootstrap — set this **before** the first deploy/boot, since the seeder only runs once (when no SuperAdmin exists yet). |
| `SeedSuperAdmin__Password` | The real SuperAdmin password to bootstrap. Change it from inside the app immediately after first login. |

**Frontend — Vercel.** Set `VITE_API_URL` in the Vercel project's environment variables to the Render backend's public URL (e.g. `https://learnafrica-lite-api.onrender.com`). The existing `frontend/vercel.json` already handles SPA routing rewrites.

**Known limitation — file uploads.** `IFileStorageService`'s default implementation (`LocalFileStorageService`) writes thumbnails/resources to local disk (`wwwroot/uploads`), which is **not persistent** on Render's free/standard web services — files are lost on every redeploy or restart. The service is built behind an interface specifically so it can be swapped for Supabase Storage or S3-compatible blob storage later without touching any controller code; do this before relying on uploads in production.
