# ADR 0001: Admin Dashboard in a Separate Repository

**Status:** Accepted  
**Date:** 2026-07-15  
**Owner:** Joseph / Trouve Tech  

## Decision

This repository (`cetech-academy-admin`) contains the **admin and super-admin console** for CeTech Academy. It is maintained separately from the public marketing site and student/staff portal, which live in the `cetech-academy` repository.

## Repository split

| Repository | Surface | Primary users |
|---|---|---|
| `cetech-academy` | Public marketing site, student portal, staff portal | Visitors, applicants, students, staff |
| `cetech-academy-admin` (this repo) | Admin console + super-admin console | Admins, super admins |
| Shared backend | NestJS API + Supabase Postgres/Storage | Both repositories consume the same API |

## Full context & rationale

See the canonical ADR in the main repository:

```
cetech-academy/docs/adr/0001-admin-dashboard-separate-repo.md
```

## Consequences for this repo

- Do not add marketing pages, student views, or public-facing content here.
- All privileged data access must flow through the shared backend API.
- Authentication uses the same Clerk identity provider as the main app.
- Shared contracts (DTOs, Zod schemas, types) should be generated from the backend OpenAPI spec or published as a shared package to avoid drift.
