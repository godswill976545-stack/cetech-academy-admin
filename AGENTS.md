# Project Brief: cetech-academy-admin

## Tech Stack
- **Frontend:** Next.js 15 (App Router) with TypeScript, Mantine v7, and Tailwind CSS v4
- **Backend:** Consumes the shared CeTech Academy API (NestJS / Next.js API routes in the main repo)
- **Auth:** Clerk (same provider as the main app)
- **Hosting:** Vercel (recommended)

## Rules & Conventions
- **Scope:** This repository contains **only** the admin and super-admin console. Do not add marketing pages, student portal views, or public-facing content here.
- **Styling:** Use Mantine components as the primary UI layer. Tailwind CSS is available for layout utilities and custom fine-tuning. Primary CSS entry: `src/styles/tailwind.css`.
- **Architecture:** Next.js App Router under `src/app/`. Admin routes live in `src/app/(admin)/` with a shared layout. Shared UI in `src/components/`, data layer in `src/lib/`, state in `src/stores/`.
- **Auth:** Sign-in is Clerk-only. `src/lib/auth.ts` resolves the current user and enforces admin/staff access server-side. UI should reflect role/track scope but must never be the security boundary.
- **Data access:** All privileged reads/writes go through the shared backend API (`src/lib/api.ts`). Do not connect directly to Supabase from this repository.
- **Environment Variables:** Retrieve all secrets from `.env.local`. Never hardcode API keys or credentials.

## Related Repositories
- `cetech-academy` — public marketing site, student portal, staff portal, and shared backend API routes
- See `docs/adr/0001-admin-dashboard-separate-repo.md` for the repo-split rationale.

## Important Reminders
- The `requireAdmin` helper currently scaffolds access for any authenticated Clerk user. Replace it with a real backend role lookup before production.
- Staff users are track-scoped; dashboard views must respect `assignedTracks` once the backend provides them.
- Super-admin-only actions (refunds, provider config, destructive ops) should be gated both in the UI and on the backend.
