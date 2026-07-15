# CeTech Academy — Admin Dashboard

Administration console for CeTech Academy. This repository contains the admin and super-admin surfaces only.

## Scope

| Surface | Repository |
|---|---|
| Public marketing site + student/staff portal | [`cetech-academy`](https://github.com/org/cetech-academy) |
| Admin + super-admin console | **This repository** |
| Shared backend API | NestJS API consumed by both repositories |

See `docs/adr/0001-admin-dashboard-separate-repo.md` for the architecture decision.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **UI:** Mantine v7 + Tailwind CSS v4
- **Auth:** Clerk (same identity provider as the main app)
- **State:** Zustand + TanStack Query
- **HTTP:** Axios against the shared API

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variables (see .env.example)
cp .env.example .env.local

# Run the dev server
npm run dev
```

The app runs on [http://localhost:3001](http://localhost:3001) by default (use a different port if the main app is on 3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Base URL of the shared backend API |

## Project Structure

```
src/
  app/
    (admin)/           # Admin route group with shared layout
      dashboard/       # Dashboard + admin modules
        students/
        payments/
        content/
        staff/
        cohorts/
        settings/
    login/             # Admin sign-in
    layout.tsx         # Root layout (Clerk + Mantine)
  components/          # AdminShell, shared UI
  lib/                 # API client, auth helpers
  stores/              # Zustand stores
  styles/              # Tailwind entry
  types/               # Shared TypeScript types
```

## Notes

- This repo does **not** contain the marketing site or student portal.
- Admin role/track scoping is enforced by the shared backend; the UI reflects it but does not rely on it for security.
- The current `requireAdmin` helper is a scaffold. Replace the inline role assumption with a backend role lookup before shipping.
