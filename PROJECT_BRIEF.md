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
| Auth | **Custom invite-only system** — JWT + httpOnly cookies, bcrypt, role-based (SUPER_ADMIN, ADMIN, TUTOR) |
| Database | Supabase Postgres (shared with main cetech-academy repo) |
| Data Fetching | TanStack React Query + Axios |
| State | Zustand (client auth state) |
| Hosting | Vercel (production) |
| JWT Library | jose (edge-runtime compatible) |
| Password Hashing | bcryptjs (12 salt rounds) |

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
│   │   ├── api/
│   │   │   ├── auth/                 # Auth routes (login, logout, refresh, me)
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   ├── refresh/route.ts
│   │   │   │   └── me/route.ts
│   │   │   └── admin/               # Protected admin API routes
│   │   │       ├── dashboard/
│   │   │       │   ├── metrics/route.ts
│   │   │       │   └── activity/route.ts
│   │   │       ├── students/route.ts
│   │   │       ├── applications/route.ts
│   │   │       ├── cohorts/route.ts
│   │   │       ├── payments/route.ts
│   │   │       ├── staff/route.ts
│   │   │       ├── curriculum/route.ts
│   │   │       ├── settings/route.ts
│   │   │       ├── invitations/route.ts
│   │   │       ├── invite/accept/route.ts
│   │   │       └── change-password/route.ts
│   │   ├── login/page.tsx            # Custom login page
│   │   ├── invite/accept/page.tsx    # Public invite acceptance page
│   │   └── unauthorized/page.tsx
│   ├── lib/
│   │   ├── api-handler.ts            # withAdminAuth middleware
│   │   ├── auth.ts                   # Custom auth resolution (JWT + DB lookup)
│   │   ├── auth-utils.ts             # JWT signing, password hashing, invite tokens
│   │   ├── session.ts                # Session management (cookies + DB)
│   │   ├── api.ts                    # Axios client
│   │   ├── hooks.ts                  # Re-exports all hooks
│   │   ├── admin-hooks.ts            # TanStack Query hooks
│   │   └── supabase/admin.ts         # Service-role Supabase client
│   ├── types/index.ts                # TypeScript interfaces
│   └── proxy.ts                      # Custom auth middleware (JWT verification)
├── supabase/migrations/
│   └── 009_custom_admin_auth.sql     # Migration for password_hash, invitations, sessions
├── .env.local                        # Environment variables
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 5. How Auth Works (Custom System)

No Clerk. Fully internal invite-only auth with JWT + httpOnly cookies.

### Flow

```
Super Admin / Admin → Invite Staff → Link generated → Staff opens link → Sets password → Auto-login → Dashboard
```

### Detailed Auth Flow

```
proxy.ts (middleware)
  ↓
  Public paths: /login, /invite/accept, /api/auth/* → pass through
  /api/admin/* → verify admin_access_token cookie → 401 if invalid
  /dashboard/* → verify admin_access_token cookie → redirect to /login if invalid
```

### API Route Auth

```
withAdminAuth() in api-handler.ts
  ↓
  Read cookies (req.cookies for API routes, cookies() for server components)
  ↓
  Verify access token → fetch user from DB → check role
  ↓
  SUPER_ADMIN / ADMIN → allowed
  TUTOR → allowed (read-only routes)
  No role → 403 Forbidden
```

### Role Hierarchy

| Role | Can Invite |
|------|-----------|
| SUPER_ADMIN | SUPER_ADMIN, ADMIN, TUTOR |
| ADMIN | TUTOR only |
| TUTOR | Cannot invite anyone |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth-utils.ts` | hashPassword, verifyPassword, generateAccessToken (15min), generateRefreshToken (7d), generateInviteToken |
| `src/lib/session.ts` | createSession (set cookies + DB), destroySession, refreshSession (token rotation) |
| `src/lib/auth.ts` | getUserFromToken, resolveUser, requireAdmin, requireStaff |
| `src/proxy.ts` | Reads access_token cookie, verifies JWT, blocks unauthorized requests |

### Cookies

| Cookie | Path | Max Age | Purpose |
|--------|------|---------|---------|
| `admin_access_token` | `/` | 15 minutes | Short-lived JWT for API auth |
| `admin_refresh_token` | `/api/auth/refresh` | 7 days | Long-lived JWT for token rotation |

Both cookies are `httpOnly`, `secure`, `sameSite=lax`.

### Password Policy
- Minimum 8 characters
- Stored as bcrypt hash (12 salt rounds)
- No forgot password flow
- Password change only inside dashboard when logged in (`/api/admin/change-password`)

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
| `users` | All users (students + staff). Has `role`, `assigned_tracks`, `password_hash` columns |
| `tracks` | 6 disciplines (UI/UX, Software Eng, etc.) |
| `cohorts` | Class groups (max 30 students, linked to track) |
| `applications` | Enrollment funnel: APPLIED → ASSESSED → OFFER → ENROLLED → ACTIVE |
| `invoices` | Payment records (linked to student + cohort) |
| `ledger_entries` | Append-only financial ledger |
| `audit_log` | All admin actions logged here |
| `courses` | Course catalog (title, description, price) |
| `units` | Course units (linked to courses) |
| `lessons` | Individual lessons (linked to units) |
| `admin_settings` | Portal config (providers, policies) |
| `quiz_results` | Student quiz attempts |
| `enrollments` | Student-course enrollment records |
| `admin_invitations` | Pending staff invitations (token, role, expiry) |
| `admin_sessions` | Active sessions (refresh tokens, user_agent, expiry) |

### ⚠️ Important Schema Notes

- `audit_log.actor_id` — use `users.id` (UUID). To get actor info, join via `users`.
- `courses` has **no `level` or `track_id` columns**. Don't query for them.
- `users` has **no `status` column**. Use `payment_status` instead.
- Cohort/application statuses are **UPPERCASE** in DB (`OPEN`, `PLANNING`, `APPLIED`, `ASSESSED`), but the API transforms them to **lowercase** for the UI.
- `users.password_hash` is nullable — only set after a user accepts an invitation.

---

## 7. Environment Variables

All set in Vercel dashboard under **Settings → Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `ACCESS_TOKEN_SECRET` | `your-random-secret` | JWT signing secret for access tokens (min 32 chars) |
| `REFRESH_TOKEN_SECRET` | `your-random-secret` | JWT signing secret for refresh tokens (min 32 chars) |
| `NEXT_PUBLIC_MAIN_REPO_SUPABASE_URL` | `https://kohlegvunumiwxbhfbwb.supabase.co` | Main repo Supabase URL |
| `MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Service-role key (bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | `https://cetech-academy-admin.vercel.app` | Production URL |
| `NEXT_PUBLIC_API_URL` | `https://cetech-academy-admin.vercel.app/api` | API base URL |
| `NEXT_PUBLIC_ADMIN_API_URL` | `https://cetech-academy-admin.vercel.app/api` | Same as above |

**⚠️ Security:** The `MAIN_REPO_SUPABASE_SERVICE_ROLE_KEY` bypasses ALL Row-Level Security. Never expose it to the client. Never commit it to git. The JWT secrets must also be kept secret and never exposed to the client.

---

## 8. Invite Flow

### How Invitations Work

1. **Super Admin / Admin** goes to **Staff** page in dashboard
2. Clicks **"Invite Staff"**
3. Fills in: email, role (Admin/Tutor), tracks (if Tutor)
4. System generates a unique invite link
5. **Link is displayed in the UI** (no email sending yet — copy and share manually)
6. Recipient opens the link → sees **Set Password** page
7. Recipient enters full name + password → account created → auto-logged in
8. Recipient is now in the admin panel

### Creating the First Super Admin

The first user must be created **manually in Supabase**:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO users (id, email, full_name, role, password_hash)
VALUES (
  gen_random_uuid(),
  'your-email@example.com',
  'Your Name',
  'SUPER_ADMIN',
  '$2a$12$<bcrypt-hash-of-your-password>'
);
```

To generate a bcrypt hash, use Node.js:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"
```

After creating the first Super Admin, you can log in at `/login` and start inviting others.

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Email + password → login |
| `/api/auth/logout` | POST | Destroy session → clear cookies |
| `/api/auth/refresh` | POST | Rotate refresh token → new access token |
| `/api/auth/me` | GET | Return current user info |
| `/api/admin/invitations` | GET | List pending invitations |
| `/api/admin/invitations` | POST | Create new invitation |
| `/api/admin/invite/accept` | POST | Accept invitation + set password |
| `/api/admin/change-password` | POST | Change password (when logged in) |

---

## 9. API Routes (Admin)

All routes are behind `withAdminAuth()` which:
1. Reads the access token from cookies
2. Verifies the JWT signature
3. Fetches the user from the database
4. Checks their role (must be ADMIN or SUPER_ADMIN)
5. Creates a service-role Supabase client
6. Logs the API call to `audit_log`
7. Calls the route handler

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
| `/api/admin/invitations` | GET/POST | List/create invitations |
| `/api/admin/invite/accept` | POST | Accept invitation |
| `/api/admin/change-password` | POST | Change password |

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
2. **Remove all old Clerk environment variables** from Vercel
3. Run the database migration (if not already done): `supabase/migrations/009_custom_admin_auth.sql`
4. Create the first SUPER_ADMIN user in Supabase (see section 8)
5. Generate JWT secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 11. Known Issues & Gotchas

1. **First user must be created manually** — There is no sign-up. The first SUPER_ADMIN must be inserted directly into the `users` table with a bcrypt password hash (see section 8).

2. **No email sending** — Invitation links are generated and displayed in the UI. You must copy and share them manually (e.g., WhatsApp, email). No email provider is integrated.

3. **No forgot password** — Intentionally omitted. Password can only be changed inside the dashboard when logged in.

4. **No `applications` page in the UI** — The route group doesn't have an applications page component yet. The API exists but there's no `src/app/(admin)/dashboard/applications/page.tsx`.

5. **Curriculum page uses `useCurriculum` hook** — This queries the `courses` table which has no `track_id` or `level` columns. The hook returns courses with a hardcoded `"General"` track and `"beginner"` level.

6. **Settings page** — The `admin_settings` table schema doesn't match the `Settings` TypeScript interface. The API returns the raw DB shape which works, but if you add a settings UI form, you'll need to align the types.

7. **TypeScript strict mode** — `ignoreBuildErrors: true` is set in `next.config.ts` because the Supabase dynamic query types cause TS errors. This is fine for now but should be cleaned up long-term.

8. **Token rotation** — Refresh tokens are single-use. Each refresh deletes the old session and creates a new one. If you open multiple tabs, they share the same session via cookies.

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

# Generate bcrypt password hash (for creating first user)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 14. Who to Contact

- **Repo owner:** godswill976545-stack (GitHub)
- **Supabase project:** `kohlegvunumiwxbhfbwb` (https://supabase.com/dashboard/project/kohlegvunumiwxbhfbwb)

---

**TL;DR:** It works. Push to `master` to deploy. Set env vars in Vercel (ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET + Supabase). Create first SUPER_ADMIN in Supabase SQL. Then invite staff from the dashboard. No Clerk — fully custom auth with JWT + httpOnly cookies.
