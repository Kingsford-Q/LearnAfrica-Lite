# LearnAfrica Lite

A full-stack LMS platform.

## Structure

- `frontend/` — React 19 + Vite + Tailwind v4 + shadcn/ui single-page app.
- `backend/` — ASP.NET Core 10 Web API (`LearnAfricaLite.Api`), EF Core + PostgreSQL.

## Running locally

### Backend

```
cd backend
docker compose up -d        # starts Postgres
cd LearnAfricaLite.Api
dotnet ef database update
dotnet run
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in `frontend/.env.local` to point at the backend (defaults to `http://localhost:5080`).

Full setup, environment variables, and deployment instructions (Render + Supabase + Vercel) are documented in `backend/README.md`.
