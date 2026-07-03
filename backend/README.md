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
| `Supabase__Url` | Your Supabase project URL, e.g. `https://<project-ref>.supabase.co`. Setting this switches file uploads from local disk to Supabase Storage — see below. |
| `Supabase__ServiceRoleKey` | Project Settings → API → `service_role` secret key (not the `anon` key — uploads need write access). |
| `Supabase__StorageBucket` | Optional, defaults to `uploads`. |

Email (optional — if unset, the app logs password-reset links instead of emailing them, which still works fine for testing):

| Variable | Value |
|---|---|
| `Email__SmtpHost` | e.g. `smtp.sendgrid.net` |
| `Email__SmtpPort` | e.g. `587` |
| `Email__SmtpUser` / `Email__SmtpPassword` | Your SMTP provider's credentials |
| `Email__FromAddress` / `Email__FromName` | The From address/name on outgoing mail |

**Frontend — Vercel.** Set `VITE_API_URL` in the Vercel project's environment variables to the Render backend's public URL (e.g. `https://learnafrica-lite-api.onrender.com`). The existing `frontend/vercel.json` already handles SPA routing rewrites.

**File uploads — Supabase Storage.** Render's filesystem is ephemeral (uploads saved to local disk are lost on every redeploy/restart), so production needs `Supabase__Url` + `Supabase__ServiceRoleKey` set — `IFileStorageService` automatically switches from `LocalFileStorageService` to `SupabaseStorageService` when they're present (see `Program.cs`). One-time setup in the Supabase dashboard before first deploy:

1. Storage → New bucket → name it `uploads` (or match `Supabase__StorageBucket`) → **Public bucket** on.
2. That's it — no RLS policies needed for reads since the bucket is public, and writes go through the service-role key which bypasses RLS.

Local development needs none of this — with no `Supabase__Url` configured, uploads fall back to local disk automatically.
