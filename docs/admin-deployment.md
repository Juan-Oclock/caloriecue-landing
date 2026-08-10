# CalorieCue Admin Dashboard - Deployment Guide

## Prerequisites

- Vercel account with the `caloriecue-landing` project deployed
- Supabase project: `bxhgpvkkeyguovvyqsft`
- DNS access for `caloriecue.app` domain
- Supabase CLI installed (`npm install -g supabase` or use project-local `npx supabase`)

---

## 1. Database Setup

Run these SQL files in order via the **Supabase SQL Editor** (Dashboard > SQL Editor > New Query):

```
supabase/migrations/001_dashboard_snapshots.sql
supabase/migrations/002_dashboard_config.sql
supabase/migrations/003_admin_access_logs.sql
supabase/migrations/004_rls_policies.sql
supabase/migrations/005_cron_schedule.sql   (requires pg_cron extension enabled)
```

### Add yourself as admin

After running the migrations, update the admin_user_ids config:

```sql
UPDATE dashboard_config
SET value = '["YOUR-SUPABASE-USER-UUID"]'::jsonb,
    updated_at = now()
WHERE key = 'admin_user_ids';
```

### Seed test data (optional)

```
supabase/seed/dashboard_seed.sql
```

---

## 2. Environment Variables

### Vercel Dashboard

Go to **Vercel > Project Settings > Environment Variables** and add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL assigned to that environment | Production, Preview, Dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anon key from the same environment's project | Production, Preview, Dev |
| `SUPABASE_SERVICE_ROLE_KEY` | The service-role key from the same environment's project | Production by default; approved isolated non-production only |
| `ADMIN_USER_IDS` | Comma-separated UUIDs of admin users | Production, Preview |

### Local Development

Use local or dedicated Development Supabase credentials in `.env.local` when
privileged local testing is explicitly needed. Never copy the Production
`SUPABASE_SERVICE_ROLE_KEY` into local Development or Preview.

### Macro cheat sheet delivery

The delivery endpoint is **enabled in Vercel Production only by default**.
Preview and local Development builds contain the route but leave delivery
disabled by omitting its complete privileged credential bundle; automated tests
mock Resend and the limiter. A Preview or local environment may be enabled only
for an explicitly approved end-to-end test using an isolated non-production
Supabase project and a non-production Resend key.

Every enabled environment requires one internally consistent bundle:

| Enabled environment | Supabase URL | Service-role key | Limiter secret |
|---|---|---|---|
| Production | Production project URL | Production project's key | Stable Production-only value |
| Approved Preview | Dedicated Preview project URL | That Preview project's key | Stable Preview-only value |
| Approved local Development | Local or dedicated Development project URL | That local/Development project's key | Stable local/Development-only value |

The Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`, or server-only `SUPABASE_URL` when
applicable) and `SUPABASE_SERVICE_ROLE_KEY` must come from the same project.
Never reuse the Production service-role key or limiter secret in Preview or
local Development. Generate each `MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET` from at
least 32 random bytes (for example, `openssl rand -base64 32`), keep it
server-only, and never expose it through a `NEXT_PUBLIC_*` variable. All
instances within one environment share that environment's value. Rotation
starts new rate-limit identities and delivery keys, so rotate only as a planned
release operation.

Deploy the macro delivery hardening in this order:

1. For each environment being enabled, apply and verify
   `supabase/migrations/20260809233743_macro_cheat_sheet_rate_limits.sql` in the
   matching Supabase project **before** provisioning the delivery credentials or
   deploying application code that calls `consume_macro_cheat_sheet_rate_limit`.
2. Confirm the table has RLS forced, `anon` and `authenticated` have no table or
   function privileges, and only `service_role` can execute the RPC.
3. Configure the matching Supabase URL, that project's
   `SUPABASE_SERVICE_ROLE_KEY`, the environment's `RESEND_API_KEY`, and its
   minimum-32-byte `MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET` in only that application
   environment.
4. Pass the focused delivery tests, full test suite, SEO verification, static
   route verification, and production build before releasing the code.
5. After release, use an invalid-address smoke test or an explicitly authorized
   test inbox; never use a production recipient as an automatic deployment
   check.

If rollback is needed, redeploy the previous application version first while
leaving the additive rate-limit migration and secret in place. Do not drop the
table or RPC while any deployed version may call it. If database removal is
later required, ship a separately reviewed follow-up migration only after all
application environments no longer depend on the RPC.

---

## 3. Subdomain Setup

### Vercel Custom Domain

1. Go to **Vercel > Project Settings > Domains**
2. Add `admin.caloriecue.app`
3. Vercel will provide DNS configuration instructions

### DNS Record

Add a CNAME record to your DNS provider:

```
Type:  CNAME
Name:  admin
Value: cname.vercel-dns.com
TTL:   Auto
```

### Optional: Host-based Rewriting

To make `admin.caloriecue.app/` render `/admin` routes, the middleware already handles admin route protection. For subdomain rewriting, you can add this to `middleware.ts`:

```ts
// At the top of the middleware function:
const hostname = request.headers.get('host') || '';
if (hostname.startsWith('admin.') && !request.nextUrl.pathname.startsWith('/admin')) {
  const url = request.nextUrl.clone();
  url.pathname = `/admin${request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}
```

---

## 4. Edge Function Deployment

### Deploy the compute-metrics function

```bash
npx supabase functions deploy compute-metrics --project-ref bxhgpvkkeyguovvyqsft
```

### Set Edge Function secrets

```bash
npx supabase secrets set ADMIN_USER_IDS="your-admin-uuid" --project-ref bxhgpvkkeyguovvyqsft
```

### Verify deployment

```bash
# Test the function (replace with your actual JWT)
curl -X POST \
  'https://bxhgpvkkeyguovvyqsft.supabase.co/functions/v1/compute-metrics' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"manual": true}'
```

---

## 5. Cron Schedule

The `005_cron_schedule.sql` migration sets up `pg_cron` to call the Edge Function daily at 4:00 PM UTC (midnight Manila time).

### Verify cron is running

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-dashboard-snapshot';
```

### Check cron execution history

```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-dashboard-snapshot')
ORDER BY start_time DESC
LIMIT 10;
```

### Note on pg_cron

`pg_cron` must be enabled in your Supabase project:
- Go to **Supabase Dashboard > Database > Extensions**
- Enable `pg_cron` and `pg_net`

---

## 6. Verification Checklist

- [ ] Database tables created (`dashboard_snapshots`, `dashboard_config`, `admin_access_logs`)
- [ ] RLS policies active (test with non-admin user - should get empty results)
- [ ] Admin user UUID added to `dashboard_config.admin_user_ids`
- [ ] Environment variables set in Vercel
- [ ] `admin.caloriecue.app` DNS configured and SSL active
- [ ] Edge Function deployed and responding
- [ ] Cron job scheduled and executing
- [ ] Login flow works: `admin.caloriecue.app` -> login -> dashboard
- [ ] Non-admin user gets "Access Denied" page
- [ ] Manual snapshot refresh works from dashboard
- [ ] All 6 dashboard pages render with data

---

## Architecture Overview

```
Browser (admin.caloriecue.app)
    │
    ├─► Next.js Middleware (session refresh + admin check)
    │       │
    │       ├─► /admin/login       (public)
    │       ├─► /admin/unauthorized (public)
    │       └─► /admin/*           (protected)
    │
    ├─► Server Components (fetch from Supabase via RLS)
    │       └─► dashboard_snapshots table
    │
    └─► RefreshButton → Edge Function (compute-metrics)
            └─► Queries app DB → Inserts snapshot

pg_cron (daily at midnight Manila)
    └─► HTTP POST → Edge Function → Same flow
```
