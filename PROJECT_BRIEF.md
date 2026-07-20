# CeTech Academy — Admin Panel Project Brief

> **Written for:** Software Teammate
> **Date:** July 21, 2026
> **Status:** ✅ Live and working

---

## 1. What Is This?

A **standalone admin dashboard** for CeTech Academy — built with Next.js, connected to the same Supabase database as the main cetech-academy student-facing app. It lets admins manage students, applications, cohorts, payments, staff, curriculum, and view analytics.

**Live URL:** https://cetech-academy-admin.vercel.app
**GitHub Repo:** https://github.com/godswill976545-stack/cetech-academy-admin

---

## 2. Why Is It Separate?

Per **ADR 0001** (`docs/adr/0001-admin-dashboard-separate-repo.md`), the admin panel lives in its own repo — not a monorepo — because:

- Different deployment cycle (admin features ship independently)
- Different security posture (admin uses service-role key to bypass RLS)
- Different team velocity (admin UI changes vs. student-facing features)

Both apps share the **same Supabase Postgres database**.

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI Library | Mantine v7 + Tailwind CSS v4 |
| Auth | Clerk (role-based: SUPER_ADMIN, ADMIN, STAFF) |
| Database | Supabase Postgres (shared with main cetech-academy repo) |
| Data Fetching | TanStack React Query + Axios |
| State | Zustand (client auth state) |
| Hosting | Vercel (production) |

---

## 4. Project Structure

```
cetech-academy-admin/
├── src/
│   ├── app/
│   │   ├── (admin)/dashboard/        # All dashboard pages (route group)
│   │   │   ├── page.tsx              # Main dashboard with metrics
│   │   │   ├── students/page.tsx
│   │   │   ├── applications/page.tsx
│   │   │   ├── cohorts/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   ├── staff/page.tsx
│   │   │   ├── content/page.tsx      # Curriculum management
│   │   │   └── settings/page.tsx
│   │   ├── api/admin/                # All API routes
│   │   │   ├── dashboard/
│   │   │   │   ├── metrics/route.ts  # Dashboard analytics
│   │   │   │   └── activity/route.ts # Audit log feed
│   │   │   ├── students/route.ts
│   │   │   ├── applications/route.ts
│   │   │   ├── cohorts/route.ts
│   │   │   ├── payments/route.ts
│   │   │   ├── staff/route.ts
│   │   │   ├── curriculum/route.ts
│   │   │   └── settings/route.ts
│   │   ├── login/[[...rest]]/page.tsx # Clerk login
│   │   └── unauthorized/page.tsx
│   ├── lib/
│   │   ├── api-handler.ts            # withAdminAuth middleware
│   │   ├── auth.ts                   # Clerk role resolution
│   │   ├── api.ts                    # Axios client
│   │   ├── hooks.ts                  # Re-exports all hooks
│   │   ├── admin-hooks.ts            # TanStack Query hooks
│   │   └── supabase/admin.ts         # Service-role Supabase client
│   ├── types/index.ts                # TypeScript interfaces
│   └── proxy.ts                      # Clerk middleware
├── .env.local                        # Environment variables
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 5. How Auth Works

```
Browser → Clerk Login → JWT Cookie → Next.js Middleware (proxy.ts)
                                          ↓
                                    /api/admin/* → skip Clerk, handle auth in route
                                    /dashboard/* → Clerk protect()
                                          ↓
                                    withAdminAuth() in api-handler.ts
                                          ↓
                                    Resolve Clerk user → Check publicMetadata.role
                                          ↓
                                    SUPER_ADMIN / ADMIN → allowed
                                    STAFF → allowed (read-only routes)
                                    No role → 403 Forbidden
```

**Key detail:** The Clerk middleware (`proxy.ts`) explicitly skips `/api/admin/*` routes because those routes handle their own auth via `withAdminAuth()`. This was a critical fix — without it, all API routes returned 404.

---

## 6. Database Connection

The admin panel connects to the **main cetech-academy Supabase database** using the **service_role key** (bypasses Row-Level Security).

**File:** `src/lib/supabase/admin.ts`

```typescript
createClient(
  process.env.NEXT_PUBLIC_MAIN_REPO_SUPABASE_URL,
  process.env.MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY
)
```

### Tables Used

| Table | Purpose |
|-------|---------|
| `users` | All users (students + staff). Has `role`, `assigned_tracks`, `clerk_id` columns |
| `tracks` | 6 disciplines (UI/UX, Software Eng, etc.) |
| `cohorts` | Class groups (max 30 students, linked to track) |
| `applications` | Enrollment funnel: APPLIED → ASSESSED → OFFER → ENROLLED → ACTIVE |
| `invoices` | Payment records (linked to student + cohort) |
| `ledger_entries` | Append-only financial ledger |
| `audit_log` | All admin actions logged here (actor_id is Clerk user ID) |
| `courses` | Course catalog (title, description, price) |
| `units` | Course units (linked to courses) |
| `lessons` | Individual lessons (linked to units) |
| `admin_settings` | Portal config (providers, policies) |
| `quiz_results` | Student quiz attempts |
| `enrollments` | Student-course enrollment records |

### ⚠️ Important Schema Notes

- `audit_log.actor_id` is a **Clerk string ID** (e.g. `user_2abc123`), NOT a UUID. There is **no foreign key** to `users`. To get actor info, join via `users.clerk_id`.
- `courses` has **no `level` or `track_id` columns**. Don't query for them.
- `users` has **no `status` column**. Use `payment_status` instead.
- Cohort/application statuses are **UPPERCASE** in DB (`OPEN`, `PLANNING`, `APPLIED`, `ASSESSED`), but the API transforms them to **lowercase** for the UI.

---

## 7. Environment Variables

All set in Vercel dashboard under **Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Clerk publishable key |
| `CLERK_SECRET_KEY` | `sk_test_...` | Clerk secret key (server-only) |
| `NEXT_PUBLIC_MAIN_REPO_SUPABASE_URL` | `https://kohlegvunumiwxbhfbwb.supabase.co` | Main repo Supabase URL |
| `MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Service-role key (bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | `https://cetech-academy-admin.vercel.app` | Production URL |
| `NEXT_PUBLIC_API_URL` | `https://cetech-academy-admin.vercel.app/api` | API base URL |
| `NEXT_PUBLIC_ADMIN_API_URL` | `https://cetech-academy-admin.vercel.app/api` | Same as above |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` | |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/login` | |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | |

**⚠️ Security:** The `MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY` bypasses ALL Row-Level Security. Never expose it to the client. Never commit it to git.

---

## 8. Clerk Configuration

In the Clerk Dashboard (https://dashboard.clerk.com):

### Paths (Configure → Developers → Paths)
- **Fallback development host:** `https://cetech-academy-admin.vercel.app`
- **Home URL:** `/dashboard`
- **SignIn:** Sign-in page on development host → `/login`
- **SignUp:** Sign-up page on development host → `/login`
- **Signing Out:** Page on development host → `/login`

### User Roles (Public Metadata)
To access the admin panel, users need a `role` in their Clerk `publicMetadata`:

```json
{
  "role": "SUPER_ADMIN"
}
```

Valid roles: `SUPER_ADMIN`, `ADMIN`, `STAFF`

Set this in Clerk Dashboard → Users → [user] → Public metadata.

---

## 9. API Routes

All routes are behind `withAdminAuth()` which:
1. Resolves the Clerk user
2. Checks their role (must be ADMIN or SUPER_ADMIN)
3. Creates a service-role Supabase client
4. Logs the API call to `audit_log`
5. Calls the route handler

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/dashboard/metrics` | GET | Dashboard stats (students, revenue, cohorts, quiz completion) |
| `/api/admin/dashboard/activity` | GET | Recent audit log entries with actor info |
| `/api/admin/students` | GET/POST | List/create students |
| `/api/admin/applications` | GET/POST | List/create applications (with user/track/cohort joins) |
| `/api/admin/cohorts` | GET/POST | List/create cohorts (with track info + application counts) |
| `/api/admin/payments` | GET | List invoices with stats (total, paid, pending, overdue) |
| `/api/admin/staff` | GET | List admin/staff users |
| `/api/admin/curriculum` | GET | List courses with units and lessons |
| `/api/admin/settings` | GET/PATCH | Read/update admin settings |

### Response Format
All endpoints return:
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 50
}
```

---

## 10. Deployment

### Deploy to Vercel
```bash
cd cetech-academy-admin
vercel --prod --yes
```

Or just push to `master` — Vercel auto-deploys from GitHub.

### After Deployment
1. Set environment variables in Vercel dashboard (see section 7)
2. Update Clerk redirect URLs if the domain changed
3. Assign admin roles in Clerk for new users

---

## 11. Known Issues & Gotchas

1. **Clerk dev keys in production** — The current setup uses `pk_test_` / `sk_test_` keys. Clerk will show a warning. To go fully production, get live keys from Clerk.

2. **No `applications` page in the UI** — The route group doesn't have an applications page component yet. The API exists but there's no `src/app/(admin)/dashboard/applications/page.tsx`.

3. **Curriculum page uses `useCurriculum` hook** — This queries the `courses` table which has no `track_id` or `level` columns. The hook returns courses with a hardcoded `"General"` track and `"beginner"` level.

4. **Settings page** — The `admin_settings` table schema doesn't match the `Settings` TypeScript interface. The API returns the raw DB shape which works, but if you add a settings UI form, you'll need to align the types.

5. **TypeScript strict mode** — `ignoreBuildErrors: true` is set in `next.config.ts` because the Supabase dynamic query types cause TS errors. This is fine for now but should be cleaned up long-term.

---

## 12. How to Add a New Feature

1. Create the API route in `src/app/api/admin/[feature]/route.ts`
2. Wrap the handler with `withAdminAuth()`
3. Add a TanStack Query hook in `src/lib/admin-hooks.ts`
4. Export the hook from `src/lib/hooks.ts`
5. Create the page in `src/app/(admin)/dashboard/[feature]/page.tsx`
6. Add the nav link in the sidebar component

---

## 13. Quick Commands

```bash
# Local development
npm run dev          # Starts on http://localhost:3000

# Build check
npm run build        # Verifies no build errors

# Deploy
vercel --prod --yes  # Deploy to production

# Check logs
vercel logs https://cetech-academy-admin.vercel.app --expand

# Kill stuck dev server
taskkill //PID <pid> //F
```

---

## 14. Who to Contact

- **Repo owner:** godswill976545-stack (GitHub)
- **Supabase project:** `kohlegvunumiwxbhfbwb` (https://supabase.com/dashboard/project/kohlegvunumiwxbhfbwb)
- **Clerk app:** `sunny-panther-26` (https://dashboard.clerk.com)

---

**TL;DR:** It works. Push to `master` to deploy. Set env vars in Vercel. Assign roles in Clerk. The admin panel uses a service-role key to read/write the main cetech-academy database directly.
