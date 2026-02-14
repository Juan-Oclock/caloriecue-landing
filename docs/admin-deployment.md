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
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bxhgpvkkeyguovvyqsft.supabase.co` | Production, Preview, Dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Dev |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production only |
| `ADMIN_USER_IDS` | Comma-separated UUIDs of admin users | Production, Preview |

### Local Development

These are already in `.env.local`. Update `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_USER_IDS` with real values.

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
