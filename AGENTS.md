# Project Brief: cetech-academy-admin

## Tech Stack
- **Frontend:** Next.js 15 (App Router) with TypeScript, Mantine v7, and Tailwind CSS v4
- **Backend:** Next.js API route handlers in this repo (`src/app/api/`), server-side Neon PostgreSQL via the shared `src/lib/neon/server.ts` pool
- **Auth:** Custom JWT-based admin auth (bcrypt password hashing, `jose` JWTs, refresh-token sessions stored in `admin_sessions`)
- **Hosting:** Vercel (recommended)

## Rules & Conventions
- **Scope:** This repository contains **only** the admin and super-admin console. Do not add marketing pages, student portal views, or public-facing content here.
- **Styling:** Use Mantine components as the primary UI layer. Tailwind CSS is available for layout utilities and custom fine-tuning. Primary CSS entry: `src/styles/tailwind.css`.
- **Architecture:** Next.js App Router under `src/app/`. Admin routes live in `src/app/(admin)/` with a shared layout. Shared UI in `src/components/`, data layer in `src/lib/`, state in `src/stores/`.
- **Auth:** `src/lib/auth.ts` resolves the current admin user via JWT (`admin_access_token`) and enforces admin/staff access server-side. UI should reflect role/track scope but must never be the security boundary.
- **Data access:** ALL privileged reads/writes go through `src/lib/neon/server.ts` (`getPool()` / `query()`) using raw SQL against Neon PostgreSQL. The `withAdminAuth` wrapper in `src/lib/api-handler.ts` passes the `Pool` to each handler.
- **Environment Variables:** Retrieve all secrets from `.env.local`. Never hardcode API keys or credentials. Required env vars: `DATABASE_URL` (Neon connection string), `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`.

## Database Access
- `src/lib/neon/server.ts` — Neon connection pool (server-side only, singleton)
- `src/lib/api-handler.ts` — `withAdminAuth` wrapper that resolves the JWT user and passes the `Pool` to handlers
- `src/lib/auth.ts` — `requireAdmin`, `requireStaff`, `resolveUser` using JWT verification + Postgres lookups
- `src/lib/session.ts` — `createSession`, `destroySession`, `refreshSession` managing `admin_sessions` table
- API routes: `src/app/api/admin/*` and `src/app/api/auth/*`

## Related Repositories
- `cetech-academy` — public marketing site, student portal, staff portal, and shared database (Neon PostgreSQL)
- See `docs/adr/0001-admin-dashboard-separate-repo.md` for the repo-split rationale.

## Important Reminders
- Staff users are track-scoped; dashboard views must respect `assignedTracks` once the backend provides them.
- Super-admin-only actions (refunds, provider config, destructive ops) should be gated both in the UI and on the backend.
- The `useRevokeInvitation` hook in `src/lib/admin-hooks.ts` returns `{ success: boolean }` from the delete endpoint — do not expect a `data` property.
