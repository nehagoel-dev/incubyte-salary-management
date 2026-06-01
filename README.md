# ACME Salary Management

[Live demo website](https://incubyte-salary-management-seven.vercel.app/) [Requirements](docs/requirements.md) · [Architecture](docs/architecture.md)

HR tool for managers to manage and query salary data for ~10,000 employees across multiple countries. Replaces spreadsheets.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Node 20 · TypeScript · Express · Prisma · Zod |
| Database | PostgreSQL (Supabase) |
| Frontend | React · Vite · TypeScript · Mantine · mantine-datatable · @mantine/charts |
| Testing | Vitest · Supertest · React Testing Library |
| Deploy | Supabase (DB) · Render (API) · Vercel (web) |

---

## Run locally

### Prerequisites

- Node 20+
- A Supabase project (free tier is fine) — [supabase.com](https://supabase.com)

### 1. Clone the repo

```bash
git clone https://github.com/<you>/salary-management.git
cd salary-management
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in .env — see Environment Variables section below
npm install
npx prisma migrate deploy
npx prisma db seed        # seeds 10,000 employees (~20 seconds)
npm run dev               # starts API at http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:4000
npm install
npm run dev               # starts UI at http://localhost:5173
```

Open `http://localhost:5173` in the browser.

---

## Environment variables

### Backend — `backend/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `DATABASE_URL` | Supabase Transaction pooler string (port 6543) | Supabase → Connect → Transaction pooler. Add `?pgbouncer=true&connection_limit=1` to the end |
| `DIRECT_URL` | Supabase Session pooler string (port 5432) | Supabase → Connect → Session pooler. Used by Prisma CLI for migrations only |
| `PORT` | Port the API listens on | Any free port — default `4000` |
| `CORS_ORIGIN` | Frontend origin the API allows | `http://localhost:5173` for local dev |

> Use the Session pooler (port 5432) for `DIRECT_URL`, not the direct `db.<ref>.supabase.co` string — that address is IPv6-only and will cause migrations to hang on most local networks.

### Frontend — `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (no trailing slash) |

> Never commit `.env`. Both packages have a committed `.env.example` listing the required variable names without values.

---

## Running tests

```bash
# Backend — unit tests (mocked repositories) + integration tests (Supertest)
cd backend
npm test

# Frontend — component tests (React Testing Library + jsdom)
cd frontend
npm test

# Coverage report (either package)
npm run coverage
```

Tests do not require a live database — repositories and the API client are mocked.

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full diagram and trade-off notes.

**Backend** follows a strict layered pattern:

```
routes → controllers (HTTP + Zod validation)
       → services    (business logic)
       → repositories (Prisma only)
```

Key design decisions:
- Money is stored as integer minor units (`baseSalaryCents`) + ISO-3 currency code to avoid float precision issues
- Analytics use a fixed-rate currency table to normalise all salaries to USD — live FX deliberately out of scope (see requirements doc for reasoning)
- Pagination is offset-based (page + pageSize) — sufficient for 10k rows and produces cleaner page-number UI than cursor-based
- Seed generator (`src/lib/seed-data.ts`) is a pure function separate from the seed script (`prisma/seed.ts`) so it can be unit-tested without a database

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Database | Supabase | Migrations and seed applied via Prisma |
| API | Render | Build: `npm install && npx prisma generate && npm run build` · Start: `npx prisma migrate deploy && node dist/server.js` |
| Web | Vercel | Root: `frontend` · Framework: Vite · Output: `dist` |

> Render free tier sleeps after inactivity. The first request after sleep takes 30–60 seconds — this is expected and acceptable for a demo.

---

## Docs

| File | Contents |
|---|---|
| [docs/requirements.md](docs/requirements.md) | One-page requirements — scope, out-of-scope, and reasoning |
| [docs/architecture.md](docs/architecture.md) | Architecture diagram and trade-off notes |
| [docs/ai-notes.md](docs/ai-notes.md) | AI tool usage, key prompts, and decisions made during the build |