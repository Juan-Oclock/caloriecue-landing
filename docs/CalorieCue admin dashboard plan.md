# CalorieCue Admin Dashboard — Full Build Plan

## Project Overview

Build a comprehensive admin dashboard at `admin.caloriecue.app` that gives Juan a daily full-picture view of CalorieCue's health — user funnel, engagement, revenue, notifications, and security. The dashboard reads from pre-computed snapshots (not live queries) to protect Supabase resources as the app scales.

**Tech Stack:** NextJS (React), Supabase (Postgres + Edge Functions + Auth), Recharts (charting), Tailwind CSS  
**Data Strategy:** Pre-computed snapshots via Supabase Edge Function (daily cron + manual trigger)  
**Auth:** Supabase Auth with admin whitelist  
**Hosting:** Vercel (subdomain: admin.caloriecue.app)

---

## Team Structure

| Agent | Role | Responsibilities |
|-------|------|-----------------|
| **Agent 1 — Database Architect** | Schema & migrations | Design snapshot table, create migrations, set up RLS policies, seed test data |
| **Agent 2 — Edge Function Engineer** | Metrics computation | Build the `compute-metrics` Edge Function, cron scheduling, manual trigger endpoint |
| **Agent 3 — Frontend Engineer** | Dashboard UI | NextJS app setup, pages, components, charts, responsive layout |
| **Agent 4 — Auth & Infra Engineer** | Auth, subdomain, deployment | Supabase Auth integration, admin protection, Vercel subdomain config, environment variables |
| **Team Lead** | Review & integration | Code review checklist, integration testing, final QA across all agents' work |

---

## Agent 1 — Database Architect

### Task 1.1: Design the `dashboard_snapshots` table

Create a single flat table that stores one row per snapshot. Each row represents a point-in-time summary of all CalorieCue metrics.

**Table: `dashboard_snapshots`**

```sql
CREATE TABLE dashboard_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot_type TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'manual'

  -- === USER FUNNEL ===
  total_signups INTEGER NOT NULL DEFAULT 0,            -- all-time registered users
  signups_today INTEGER NOT NULL DEFAULT 0,            -- new signups in last 24h
  signups_this_week INTEGER NOT NULL DEFAULT 0,        -- new signups in last 7 days
  signups_this_month INTEGER NOT NULL DEFAULT 0,       -- new signups in last 30 days

  active_trials INTEGER NOT NULL DEFAULT 0,            -- users currently in 7-day free trial
  trials_started_today INTEGER NOT NULL DEFAULT 0,     -- trials that started today
  trials_started_this_week INTEGER NOT NULL DEFAULT 0, -- trials started in last 7 days

  trials_expired INTEGER NOT NULL DEFAULT 0,           -- all-time expired trials (never converted)
  trials_expired_today INTEGER NOT NULL DEFAULT 0,     -- trials that expired today
  trials_expired_this_week INTEGER NOT NULL DEFAULT 0, -- trials expired in last 7 days

  active_subscribers INTEGER NOT NULL DEFAULT 0,       -- currently paying users
  new_subscribers_today INTEGER NOT NULL DEFAULT 0,    -- converted to paid today
  new_subscribers_this_week INTEGER NOT NULL DEFAULT 0,-- converted in last 7 days
  new_subscribers_this_month INTEGER NOT NULL DEFAULT 0,

  churned_subscribers INTEGER NOT NULL DEFAULT 0,      -- all-time churned (were paying, now not)
  churned_this_week INTEGER NOT NULL DEFAULT 0,
  churned_this_month INTEGER NOT NULL DEFAULT 0,

  trial_to_paid_rate NUMERIC(5,2) DEFAULT 0,           -- % of completed trials that converted
  overall_conversion_rate NUMERIC(5,2) DEFAULT 0,      -- % of all signups that are paying

  -- === ENGAGEMENT ===
  dau INTEGER NOT NULL DEFAULT 0,                      -- daily active users (logged meal today)
  wau INTEGER NOT NULL DEFAULT 0,                      -- weekly active users
  mau INTEGER NOT NULL DEFAULT 0,                      -- monthly active users

  total_meals_logged INTEGER NOT NULL DEFAULT 0,       -- all-time meals
  meals_logged_today INTEGER NOT NULL DEFAULT 0,
  meals_logged_this_week INTEGER NOT NULL DEFAULT 0,

  total_photo_scans INTEGER NOT NULL DEFAULT 0,        -- all-time photo scans
  photo_scans_today INTEGER NOT NULL DEFAULT 0,
  photo_scans_this_week INTEGER NOT NULL DEFAULT 0,

  total_barcode_scans INTEGER NOT NULL DEFAULT 0,
  barcode_scans_today INTEGER NOT NULL DEFAULT 0,

  total_receipt_scans INTEGER NOT NULL DEFAULT 0,
  receipt_scans_today INTEGER NOT NULL DEFAULT 0,

  ghost_users INTEGER NOT NULL DEFAULT 0,              -- signed up but never logged a meal
  ghost_user_rate NUMERIC(5,2) DEFAULT 0,              -- ghost_users / total_signups * 100

  avg_meals_per_active_user NUMERIC(5,2) DEFAULT 0,    -- avg meals/day for active users
  avg_photo_scans_per_user NUMERIC(5,2) DEFAULT 0,

  -- === REVENUE ===
  mrr NUMERIC(10,2) DEFAULT 0,                         -- monthly recurring revenue
  total_revenue NUMERIC(10,2) DEFAULT 0,               -- all-time revenue
  revenue_this_month NUMERIC(10,2) DEFAULT 0,

  monthly_subscribers INTEGER NOT NULL DEFAULT 0,      -- breakdown by plan
  yearly_subscribers INTEGER NOT NULL DEFAULT 0,

  -- === NOTIFICATIONS & EMAILS ===
  emails_sent_today INTEGER NOT NULL DEFAULT 0,
  emails_sent_this_week INTEGER NOT NULL DEFAULT 0,
  emails_sent_this_month INTEGER NOT NULL DEFAULT 0,

  push_notifications_sent_today INTEGER NOT NULL DEFAULT 0,
  push_notifications_sent_this_week INTEGER NOT NULL DEFAULT 0,

  -- === SECURITY & SYSTEM ===
  failed_login_attempts_today INTEGER NOT NULL DEFAULT 0,
  failed_login_attempts_this_week INTEGER NOT NULL DEFAULT 0,
  suspicious_activity_flags INTEGER NOT NULL DEFAULT 0, -- any anomalies detected

  api_errors_today INTEGER NOT NULL DEFAULT 0,
  api_errors_this_week INTEGER NOT NULL DEFAULT 0,

  edge_function_invocations_today INTEGER NOT NULL DEFAULT 0,
  db_size_mb NUMERIC(10,2) DEFAULT 0,                  -- current database size

  -- === APP STORE (manual or fetched) ===
  app_store_rating NUMERIC(3,2) DEFAULT 0,
  app_store_reviews_count INTEGER NOT NULL DEFAULT 0,
  app_store_downloads_total INTEGER NOT NULL DEFAULT 0,

  -- === METADATA ===
  computation_time_ms INTEGER DEFAULT 0,               -- how long the snapshot took to compute
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast dashboard queries
CREATE INDEX idx_snapshots_snapshot_at ON dashboard_snapshots(snapshot_at DESC);
CREATE INDEX idx_snapshots_type ON dashboard_snapshots(snapshot_type);
```

### Task 1.2: Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE dashboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Only admin can read snapshots
CREATE POLICY "Admin read access" ON dashboard_snapshots
  FOR SELECT
  USING (auth.uid() = 'JUAN_USER_UUID_HERE');

-- Only service role (Edge Function) can insert
CREATE POLICY "Service role insert" ON dashboard_snapshots
  FOR INSERT
  WITH CHECK (true); -- Edge Functions use service_role key, bypasses RLS

-- No one can update or delete via client
-- (Edge Functions with service_role bypass RLS anyway)
```

> **Note to Agent 1:** Replace `JUAN_USER_UUID_HERE` with Juan's actual Supabase Auth user UUID. This ensures only Juan can read the dashboard data from the client side.

### Task 1.3: Create a `dashboard_config` table (optional but recommended)

A small config table to store dashboard preferences and the last snapshot status.

```sql
CREATE TABLE dashboard_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed with defaults
INSERT INTO dashboard_config (key, value) VALUES
  ('last_snapshot', '{"status": "never_run", "timestamp": null, "duration_ms": null}'::jsonb),
  ('admin_user_ids', '["JUAN_USER_UUID_HERE"]'::jsonb),
  ('snapshot_schedule', '{"cron": "0 0 * * *", "timezone": "Asia/Manila"}'::jsonb);
```

### Task 1.4: Seed test data

Create a migration or seed script that inserts 30 days of fake snapshot data so the frontend team can build charts immediately without waiting for real data. Vary the numbers realistically (gradual growth in signups, some fluctuation in engagement, etc.).

### Deliverables for Agent 1
- [ ] SQL migration file for `dashboard_snapshots` table
- [ ] SQL migration file for `dashboard_config` table
- [ ] RLS policies applied
- [ ] Seed script with 30 days of realistic test data
- [ ] Document any adjustments needed based on actual CalorieCue table schema

---

## Agent 2 — Edge Function Engineer

### Task 2.1: Build the `compute-metrics` Edge Function

This is the core data pipeline. A single Supabase Edge Function that:

1. Queries all relevant CalorieCue tables
2. Computes every metric defined in the `dashboard_snapshots` schema
3. Inserts one new row into `dashboard_snapshots`
4. Updates `dashboard_config.last_snapshot` with the result

**File: `supabase/functions/compute-metrics/index.ts`**

**Function structure:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const startTime = Date.now();

  // 1. Initialize Supabase client with service_role key
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 2. Determine snapshot type from request
  const { trigger = "scheduled" } = await req.json().catch(() => ({}));

  // 3. Compute each metric category
  const funnel = await computeFunnelMetrics(supabase);
  const engagement = await computeEngagementMetrics(supabase);
  const revenue = await computeRevenueMetrics(supabase);
  const notifications = await computeNotificationMetrics(supabase);
  const security = await computeSecurityMetrics(supabase);
  const system = await computeSystemMetrics(supabase);

  // 4. Insert snapshot
  const computationTime = Date.now() - startTime;
  const { error } = await supabase.from("dashboard_snapshots").insert({
    snapshot_type: trigger,
    ...funnel,
    ...engagement,
    ...revenue,
    ...notifications,
    ...security,
    ...system,
    computation_time_ms: computationTime,
  });

  // 5. Update config with last snapshot status
  await supabase.from("dashboard_config").upsert({
    key: "last_snapshot",
    value: {
      status: error ? "failed" : "success",
      timestamp: new Date().toISOString(),
      duration_ms: computationTime,
      error: error?.message || null,
    },
  });

  return new Response(
    JSON.stringify({ success: !error, computation_time_ms: computationTime }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

### Task 2.2: Implement each metrics computation function

Each function queries the relevant CalorieCue tables. **Agent 2 must examine the actual CalorieCue Supabase schema to write accurate queries.** Below is the expected logic for each:

#### `computeFunnelMetrics(supabase)`
- Query the users/profiles table for signup counts (all-time, today, this week, this month)
- Query subscriptions/entitlements table for trial status (active, expired)
- Query for active subscribers and churned users
- Calculate `trial_to_paid_rate` = (users who converted from trial to paid) / (users whose trial ended) × 100
- Calculate `overall_conversion_rate` = (paying users) / (total signups) × 100

**Key date boundaries:**
- "Today" = since midnight in Asia/Manila timezone
- "This week" = last 7 days
- "This month" = last 30 days

#### `computeEngagementMetrics(supabase)`
- DAU: count distinct users who logged a meal today
- WAU: count distinct users who logged a meal in last 7 days
- MAU: count distinct users who logged a meal in last 30 days
- Count total meals, photo scans, barcode scans, receipt scans (all-time + today + this week)
- Ghost users: users who signed up but have zero meal entries ever
- `ghost_user_rate` = ghost_users / total_signups × 100
- `avg_meals_per_active_user` = meals_logged_today / dau
- `avg_photo_scans_per_user` = photo_scans_this_week / wau

#### `computeRevenueMetrics(supabase)`
- Count monthly vs yearly subscribers
- Calculate MRR: (monthly_subscribers × monthly_price) + (yearly_subscribers × yearly_price / 12)
- Total revenue and revenue this month from transaction/payment records if available
- If revenue data isn't tracked in Supabase, leave these as 0 and add a TODO comment

#### `computeNotificationMetrics(supabase)`
- Count emails sent (from email log table if it exists)
- Count push notifications sent
- If no email/notification logging exists, return zeros and document what tables need to be created

#### `computeSecurityMetrics(supabase)`
- Failed login attempts (from Supabase Auth logs if accessible, otherwise from any custom logging)
- API errors from any error logging table
- Flag any suspicious activity (e.g., unusual number of requests from a single user)

#### `computeSystemMetrics(supabase)`
- Edge function invocation count (if trackable)
- Database size (via `pg_database_size()` if accessible through RPC)

### Task 2.3: Set up cron scheduling

Use Supabase's `pg_cron` extension or the built-in cron feature to schedule the function.

```sql
-- Run daily at midnight Manila time (UTC+8, so 4 PM UTC previous day)
SELECT cron.schedule(
  'daily-dashboard-snapshot',
  '0 16 * * *',  -- 4 PM UTC = midnight PHT
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/compute-metrics',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || 'YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    ),
    body := '{"trigger": "scheduled"}'::jsonb
  );
  $$
);
```

> **Alternative:** If `pg_cron` + `pg_net` aren't available on Juan's Supabase plan, document how to set up an external cron via GitHub Actions, Vercel Cron, or a simple cron job that hits the Edge Function endpoint.

### Task 2.4: Manual trigger endpoint

The same Edge Function handles manual triggers. The dashboard will call it via:

```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/compute-metrics
Headers: { Authorization: Bearer <user_access_token> }
Body: { "trigger": "manual" }
```

Add authentication check at the top of the function:

```typescript
// Verify the caller is an admin (for manual triggers)
if (trigger === "manual") {
  const authHeader = req.headers.get("Authorization");
  // Verify JWT and check against admin_user_ids in dashboard_config
  // Reject if not admin
}
```

### Deliverables for Agent 2
- [ ] `supabase/functions/compute-metrics/index.ts` — complete, tested Edge Function
- [ ] All metric computation functions with accurate queries against actual CalorieCue tables
- [ ] Cron setup SQL or alternative scheduling method documented
- [ ] Manual trigger with admin auth verification
- [ ] Error handling and logging throughout
- [ ] Document any missing tables or data that would be needed for certain metrics (e.g., email logs, payment records)

---

## Agent 3 — Frontend Engineer

### Task 3.1: NextJS App Setup

Set up the NextJS app (or extend the existing landing page project) with the following structure:

```
app/
├── admin/
│   ├── layout.tsx              # Admin layout with sidebar nav, auth wrapper
│   ├── page.tsx                # Overview dashboard (default landing)
│   ├── funnel/
│   │   └── page.tsx            # User funnel deep dive
│   ├── engagement/
│   │   └── page.tsx            # Engagement metrics deep dive
│   ├── revenue/
│   │   └── page.tsx            # Revenue & subscriptions
│   ├── notifications/
│   │   └── page.tsx            # Email & push notification stats
│   ├── security/
│   │   └── page.tsx            # Security & system health
│   └── components/
│       ├── MetricCard.tsx       # Reusable stat card (value + trend arrow)
│       ├── TrendChart.tsx       # Recharts line/area chart wrapper
│       ├── FunnelChart.tsx      # Funnel visualization
│       ├── DataTable.tsx        # Sortable data table
│       ├── RefreshButton.tsx    # Manual snapshot trigger
│       ├── Sidebar.tsx          # Navigation sidebar
│       ├── DateRangePicker.tsx  # Filter by date range
│       └── SnapshotStatus.tsx   # Shows last snapshot time + status
```

### Task 3.2: Admin Layout & Navigation

**Sidebar navigation:**
- 🏠 Overview
- 👥 User Funnel
- 📊 Engagement
- 💰 Revenue
- 📧 Notifications
- 🔒 Security & System

**Top bar:**
- CalorieCue Admin title/logo
- Last snapshot timestamp + status indicator (green = recent, yellow = stale, red = failed)
- Manual "Refresh Data" button
- User avatar + logout

**Design guidelines:**
- Use Tailwind CSS
- Dark or light theme (dark preferred for dashboards)
- Mobile-responsive (Juan might check on his phone)
- Clean, minimal — no unnecessary decoration
- Color coding: green = good/up, red = bad/down, yellow = warning, blue = neutral

### Task 3.3: Overview Page (Default Dashboard)

The main page Juan sees daily. Shows the most important metrics at a glance.

**Row 1 — Key Numbers (MetricCards):**
| Total Users | Active Trials | Paying Subscribers | MRR |
|---|---|---|---|
| `total_signups` | `active_trials` | `active_subscribers` | `mrr` |
| +X today | +X started today | +X this week | trend vs last week |

**Row 2 — Engagement Quick Stats:**
| DAU | Photo Scans Today | Ghost User Rate | Trial→Paid Rate |
|---|---|---|---|
| `dau` | `photo_scans_today` | `ghost_user_rate`% | `trial_to_paid_rate`% |

**Row 3 — 30-Day Trend Charts (TrendChart components):**
- Signups over time (line chart)
- Active users over time (area chart)
- Photo scans over time (bar chart)
- Revenue trend (line chart)

**Row 4 — Recent Activity:**
- Last 7 snapshots in a mini table showing date, signups, trials, conversions

### Task 3.4: User Funnel Page

**Funnel Visualization:**
A horizontal or vertical funnel showing:
Signups → Trial Started → Trial Active → Converted to Paid → Retained
With drop-off percentages at each stage.

**Detailed Metrics Table:**
| Metric | Today | This Week | This Month | All Time |
|---|---|---|---|---|
| New Signups | X | X | X | X |
| Trials Started | X | X | X | X |
| Trials Expired | X | X | X | X |
| New Subscribers | X | X | X | X |
| Churned | — | X | X | X |

**Charts:**
- Daily signups (30-day line chart)
- Trial starts vs expirations (stacked bar chart)
- Conversion rate trend (line chart)

### Task 3.5: Engagement Page

**Key Metric Cards:**
- DAU / WAU / MAU with trends
- Avg meals per active user
- Ghost user count + rate

**Feature Usage Breakdown:**
| Feature | Today | This Week | All Time |
|---|---|---|---|
| Photo Scans | X | X | X |
| Barcode Scans | X | X | X |
| Receipt Scans | X | X | X |
| Manual Entry | X | X | X |

**Charts:**
- DAU/WAU/MAU trend (multi-line chart)
- Feature usage over time (stacked area chart)
- Ghost user rate trend (line chart with target line)

### Task 3.6: Revenue Page

**Key Metric Cards:**
- MRR with trend
- Total Revenue
- Monthly vs Yearly subscriber breakdown (donut chart)

**Subscriber Breakdown:**
- Monthly plan count + revenue
- Yearly plan count + revenue
- Conversion rate from trial

**Charts:**
- MRR trend (line chart)
- Subscriber growth (stacked area: monthly + yearly)
- Revenue per month (bar chart)

### Task 3.7: Notifications Page

**Key Metric Cards:**
- Emails sent today/week/month
- Push notifications sent today/week

**Charts:**
- Email volume over time (bar chart)
- Push notification volume over time (bar chart)

> **Note:** If email/push logging doesn't exist yet in Supabase, show placeholder UI with a message: "Enable email logging to see stats here."

### Task 3.8: Security & System Page

**Key Metric Cards:**
- Failed login attempts today/week
- API errors today/week
- Database size (MB)

**Security Alerts:**
- Show any `suspicious_activity_flags > 0` as a warning banner

**System Health:**
- Last snapshot status + computation time
- Edge Function invocations
- DB size trend over time

**Charts:**
- Failed logins over time (bar chart)
- API errors over time (line chart)
- DB size growth (area chart)

### Task 3.9: Reusable Components Spec

#### `MetricCard.tsx`
Props: `title`, `value`, `previousValue` (for trend calculation), `format` ('number' | 'currency' | 'percent'), `icon` (optional)
- Shows value prominently
- Calculates and shows trend arrow (↑ green or ↓ red) with % change
- Subtle background color coding

#### `TrendChart.tsx`
Props: `data` (array of snapshots), `dataKey` (field name), `chartType` ('line' | 'area' | 'bar'), `color`, `title`
- Wraps Recharts ResponsiveContainer
- Includes tooltip with formatted values
- X-axis shows dates, Y-axis auto-scales

#### `RefreshButton.tsx`
- Calls the Edge Function's manual trigger endpoint
- Shows loading spinner while computing
- Disables for 60 seconds after trigger (prevent spam)
- Shows success/error toast on completion

#### `DateRangePicker.tsx`
- Presets: Today, Last 7 Days, Last 30 Days, Last 90 Days, Custom
- Filters which snapshots the dashboard displays

### Task 3.10: Data Fetching Layer

Create an API utility that all pages use:

```typescript
// lib/dashboard-api.ts

export async function getLatestSnapshot(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("dashboard_snapshots")
    .select("*")
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function getSnapshotHistory(
  supabase: SupabaseClient,
  days: number = 30
) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from("dashboard_snapshots")
    .select("*")
    .gte("snapshot_at", since.toISOString())
    .order("snapshot_at", { ascending: true });
  return data || [];
}

export async function triggerManualSnapshot(supabase: SupabaseClient) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/compute-metrics`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trigger: "manual" }),
    }
  );
  return response.json();
}
```

### Deliverables for Agent 3
- [ ] All page files with complete UI
- [ ] All reusable components with proper TypeScript types
- [ ] Recharts integration with responsive charts
- [ ] Data fetching layer (`lib/dashboard-api.ts`)
- [ ] Tailwind styling — clean, consistent, dashboard-appropriate
- [ ] Mobile responsive layout
- [ ] Loading states and error states for all data-dependent components
- [ ] Date range filtering working across all pages

---

## Agent 4 — Auth & Infra Engineer

### Task 4.1: Supabase Auth Integration

Set up auth protection for the entire `/admin` route.

**Middleware approach (recommended):**

```typescript
// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = [process.env.ADMIN_USER_ID!];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // If accessing /admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // No session → redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Not admin → show forbidden
    if (!ADMIN_USER_IDS.includes(session.user.id)) {
      return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

### Task 4.2: Login Page

Create a simple `/admin/login` page:
- Email + password form (Supabase Auth signInWithPassword)
- CalorieCue branding
- Error handling for wrong credentials
- Redirect to `/admin` on success
- "Not an admin" message for unauthorized users

### Task 4.3: Unauthorized Page

Simple page at `/admin/unauthorized`:
- "You don't have access to this dashboard"
- Link back to main site
- Logout button

### Task 4.4: Subdomain Configuration

**Option A — Same Vercel project (recommended for simplicity):**
1. Add `admin.caloriecue.app` as a custom domain in Vercel
2. Use NextJS middleware to route `/admin` paths
3. Configure DNS: CNAME record for `admin` pointing to Vercel

**Option B — Separate Vercel project:**
1. Create a new Vercel project for the dashboard
2. Deploy the admin NextJS app separately
3. Configure `admin.caloriecue.app` domain

Document both options with step-by-step instructions. Recommend Option A unless there's a reason to separate.

### Task 4.5: Environment Variables

Document all required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Only for server-side/Edge Function

# Admin
ADMIN_USER_ID=uuid-of-juan

# App
NEXT_PUBLIC_APP_URL=https://admin.caloriecue.app
```

### Task 4.6: Security Hardening (CRITICAL — Must Be Bulletproof)

The admin dashboard must be inaccessible to all CalorieCue app users. Since both the app and the dashboard share the same Supabase Auth system, multiple layers of protection are required.

#### Layer 1: Server-Side Middleware (Primary Gate)

```typescript
// middleware.ts — EVERY /admin request passes through this
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

const ADMIN_USER_IDS = new Set([process.env.ADMIN_USER_ID!]);

export async function middleware(req) {
  const res = NextResponse.next();

  if (!req.nextUrl.pathname.startsWith("/admin")) return res;

  // Allow login page through
  if (req.nextUrl.pathname === "/admin/login") return res;

  const supabase = createMiddlewareClient({ req, res });
  const { data: { session }, error } = await supabase.auth.getSession();

  // No session or session error → login
  if (!session || error) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Authenticated but NOT admin → forbidden (do NOT reveal dashboard exists)
  if (!ADMIN_USER_IDS.has(session.user.id)) {
    // Log unauthorized access attempt
    console.warn(`[ADMIN AUTH] Unauthorized access attempt by user: ${session.user.id}, IP: ${req.headers.get('x-forwarded-for')}`);
    return NextResponse.redirect(new URL("/admin/unauthorized", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Requirements:**
- [ ] Admin check happens server-side in middleware — NEVER rely on client-side checks alone
- [ ] `ADMIN_USER_ID` is stored as an environment variable, never hardcoded
- [ ] Middleware covers ALL `/admin` routes including API routes (`/admin/api/*`)
- [ ] Session validation uses `getSession()` which verifies the JWT server-side

#### Layer 2: Row Level Security (Database Gate)

Even if someone bypasses the frontend entirely and calls Supabase directly with their own JWT, RLS blocks them.

```sql
-- dashboard_snapshots: Only Juan can read
CREATE POLICY "Admin read only" ON dashboard_snapshots
  FOR SELECT USING (auth.uid() = 'JUAN_USER_UUID_HERE');

-- No client-side insert/update/delete at all
CREATE POLICY "No client writes" ON dashboard_snapshots
  FOR INSERT WITH CHECK (false);
CREATE POLICY "No client updates" ON dashboard_snapshots
  FOR UPDATE USING (false);
CREATE POLICY "No client deletes" ON dashboard_snapshots
  FOR DELETE USING (false);

-- dashboard_config: Same restrictions
CREATE POLICY "Admin read config" ON dashboard_config
  FOR SELECT USING (auth.uid() = 'JUAN_USER_UUID_HERE');
CREATE POLICY "No client config writes" ON dashboard_config
  FOR INSERT WITH CHECK (false);
CREATE POLICY "No client config updates" ON dashboard_config
  FOR UPDATE USING (false);
CREATE POLICY "No client config deletes" ON dashboard_config
  FOR DELETE USING (false);
```

**Note:** The Edge Function uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely — this is correct and intended. Only the Edge Function needs write access.

**Requirements:**
- [ ] RLS enabled on both `dashboard_snapshots` and `dashboard_config`
- [ ] SELECT restricted to Juan's UUID only
- [ ] All write operations blocked for client-side (anon/authenticated roles)
- [ ] Verify RLS by testing with a non-admin user's JWT — should return zero rows

#### Layer 3: API Route Protection

Every NextJS API route under `/admin` must independently verify admin auth. Do NOT rely solely on middleware.

```typescript
// lib/admin-auth.ts — reusable server-side admin check
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ADMIN_USER_IDS = new Set([process.env.ADMIN_USER_ID!]);

export async function verifyAdmin() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !ADMIN_USER_IDS.has(session.user.id)) {
    return { authorized: false, userId: session?.user?.id || null };
  }

  return { authorized: true, userId: session.user.id, supabase };
}

// Usage in any API route or Server Component:
// const { authorized, supabase } = await verifyAdmin();
// if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

**Requirements:**
- [ ] Every API route calls `verifyAdmin()` before doing anything
- [ ] Returns 403 with generic error message (don't reveal why it failed)
- [ ] No API route trusts the middleware alone — defense in depth

#### Layer 4: Edge Function Auth (Manual Trigger Protection)

The manual snapshot trigger must verify the caller is admin.

```typescript
// Inside compute-metrics Edge Function
if (trigger === "manual") {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Verify JWT
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || !ADMIN_USER_IDS.includes(user.id)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
}
```

**Requirements:**
- [ ] Manual trigger requires valid JWT from admin user
- [ ] Scheduled triggers use service role key (no JWT needed)
- [ ] Edge Function CORS restricted to `admin.caloriecue.app` only

#### Layer 5: HTTP Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },                    // Prevent iframe embedding
  { key: "X-Content-Type-Options", value: "nosniff" },          // Prevent MIME sniffing
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },          // XSS protection
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }, // Force HTTPS
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",         // NextJS needs these
      "style-src 'self' 'unsafe-inline'",                         // Tailwind needs this
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, // Only allow Supabase
      "img-src 'self' data:",
      "frame-ancestors 'none'",                                    // No iframes
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [{ source: "/admin/:path*", headers: securityHeaders }];
  },
};
```

#### Layer 6: Rate Limiting & Brute Force Protection

```typescript
// lib/rate-limit.ts — simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  // Reset after 15 minutes
  if (record && now - record.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(ip);
    return true;
  }

  if (record && record.count >= 5) {
    return false; // Blocked — 5 attempts in 15 minutes
  }

  loginAttempts.set(ip, {
    count: (record?.count || 0) + 1,
    lastAttempt: now,
  });

  return true;
}
```

**Requirements:**
- [ ] Max 5 login attempts per IP per 15-minute window
- [ ] Manual snapshot trigger: max 1 per minute
- [ ] Failed attempts logged with IP and timestamp

#### Layer 7: Session Management

- [ ] Session expiry: Set Supabase Auth JWT expiry to a reasonable time (e.g., 1 hour for admin)
- [ ] No "remember me" on admin login — require re-authentication after session expiry
- [ ] Logout clears all session data and redirects to login
- [ ] If JWT refresh fails, redirect to login immediately

#### Layer 8: Admin Access Audit Log (Recommended)

```sql
CREATE TABLE admin_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,          -- 'login', 'logout', 'view_dashboard', 'trigger_snapshot', 'unauthorized_attempt'
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Only admin can read, only service role can write
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read logs" ON admin_access_logs
  FOR SELECT USING (auth.uid() = 'JUAN_USER_UUID_HERE');
```

Log every admin action: login, logout, page view, manual snapshot trigger, and especially unauthorized access attempts.

#### Security Testing Checklist (Team Lead Must Verify ALL)

- [ ] **Test as app user:** Log in with a regular CalorieCue user → navigate to admin.caloriecue.app → must see unauthorized page, NO dashboard data
- [ ] **Test as unauthenticated:** Navigate to admin.caloriecue.app → must redirect to login, NO flash of dashboard content
- [ ] **Test direct API calls:** Use a regular user's JWT to call `/admin/api/*` routes → must return 403
- [ ] **Test direct Supabase query:** Use a regular user's JWT to query `dashboard_snapshots` directly → must return zero rows
- [ ] **Test Edge Function trigger:** Call compute-metrics with a regular user's JWT → must return 403
- [ ] **Test brute force:** Attempt 6+ logins with wrong password from same IP → must be rate limited
- [ ] **Test session expiry:** Wait for JWT to expire → next request must redirect to login
- [ ] **Test CORS:** Call Edge Function from a different origin → must be blocked
- [ ] **Verify headers:** Check all security headers are present using securityheaders.com
- [ ] **Verify no data leak:** Check browser DevTools Network tab — no dashboard data in any response for non-admin users

### Deliverables for Agent 4
- [ ] Middleware with multi-layer auth protection
- [ ] `lib/admin-auth.ts` reusable admin verification
- [ ] `lib/rate-limit.ts` brute force protection
- [ ] Login page with Supabase Auth + rate limiting
- [ ] Unauthorized page (generic, reveals nothing about dashboard)
- [ ] Security headers in `next.config.js`
- [ ] Admin access audit log table + logging utility
- [ ] Subdomain setup documentation (step-by-step)
- [ ] Environment variables documentation
- [ ] ALL security testing checklist items passed
- [ ] All auth flows tested (login, unauthorized access, session expiry, brute force)

---

## Team Lead — Review & Integration Checklist

### Pre-Review: Schema Alignment
Before any coding starts, Team Lead must:
- [ ] Get Juan's actual Supabase table names and schema (users, meals, subscriptions, etc.)
- [ ] Share the schema with all agents so queries and column references are accurate
- [ ] Confirm which metrics can actually be computed from existing data vs which need new tables

### Agent 1 Review (Database)
- [ ] `dashboard_snapshots` schema covers all metrics defined in the plan
- [ ] RLS policies are correct and tested (admin can read, service role can write)
- [ ] Seed data is realistic and matches the schema
- [ ] Migrations are clean and can be run idempotently
- [ ] No sensitive data exposed through the schema

### Agent 2 Review (Edge Function)
- [ ] Edge Function compiles and deploys successfully
- [ ] All metric computations are accurate (spot-check against raw data)
- [ ] Cron schedule is set to correct timezone (Asia/Manila)
- [ ] Manual trigger works with proper auth
- [ ] Error handling: function doesn't crash on empty tables or missing data
- [ ] Computation time is reasonable (under 10 seconds)
- [ ] snapshot_type correctly reflects 'scheduled' vs 'manual'

### Agent 3 Review (Frontend)
- [ ] All 6 pages render correctly with seed data
- [ ] Charts are readable and responsive
- [ ] Metric cards show correct trend calculations
- [ ] Date range picker filters data correctly
- [ ] Refresh button triggers Edge Function and updates UI
- [ ] Loading and error states work
- [ ] Mobile layout is usable
- [ ] No console errors
- [ ] TypeScript types are complete (no `any`)

### Agent 4 Review (Auth & Infra)
- [ ] Unauthenticated users cannot access any `/admin` route
- [ ] Non-admin authenticated users see the unauthorized page
- [ ] Login/logout flow works end-to-end
- [ ] Subdomain resolves correctly
- [ ] All environment variables documented and set
- [ ] Security headers present
- [ ] Service role key not exposed in client bundle

### Integration Testing
- [ ] End-to-end: Trigger manual snapshot → data appears in dashboard → charts update
- [ ] Cron simulation: Insert a snapshot with known data → verify dashboard shows it correctly
- [ ] Auth flow: Login → view dashboard → refresh → logout → try to access → redirected to login
- [ ] Edge cases: Empty database (no snapshots yet) shows appropriate empty states
- [ ] Edge cases: Snapshot computation fails → dashboard shows last good snapshot + error indicator
- [ ] Performance: Dashboard loads in under 2 seconds
- [ ] Cross-browser: Chrome + Safari (since Juan uses iOS)

### Final QA
- [ ] All metrics match what's described in this plan
- [ ] No hardcoded values (all from environment variables or config)
- [ ] README.md with setup instructions
- [ ] Deployment checklist for production

---

## Appendix: Metrics Reference

Quick reference of every metric the dashboard tracks:

| Category | Metric | Source Calculation |
|----------|--------|-------------------|
| **Funnel** | Total Signups | COUNT(*) from users table |
| | Signups Today | COUNT(*) WHERE created_at >= today |
| | Active Trials | COUNT(*) WHERE trial_end > now() AND not subscribed |
| | Trials Expired | COUNT(*) WHERE trial_end < now() AND never subscribed |
| | Active Subscribers | COUNT(*) WHERE subscription_status = 'active' |
| | Churned | COUNT(*) WHERE was_subscribed AND subscription_status = 'canceled' |
| | Trial→Paid Rate | converted_from_trial / trials_completed × 100 |
| | Conversion Rate | active_subscribers / total_signups × 100 |
| **Engagement** | DAU | COUNT(DISTINCT user_id) from meals WHERE date = today |
| | WAU | COUNT(DISTINCT user_id) from meals WHERE date >= 7 days ago |
| | MAU | COUNT(DISTINCT user_id) from meals WHERE date >= 30 days ago |
| | Photo Scans | COUNT(*) from meals WHERE scan_type = 'photo' |
| | Ghost Users | COUNT(*) from users WHERE id NOT IN (SELECT user_id FROM meals) |
| | Ghost Rate | ghost_users / total_signups × 100 |
| **Revenue** | MRR | (monthly × price) + (yearly × price/12) |
| | Total Revenue | SUM from payment records |
| | Monthly Subs | COUNT(*) WHERE plan = 'monthly' AND status = 'active' |
| | Yearly Subs | COUNT(*) WHERE plan = 'yearly' AND status = 'active' |
| **Notifications** | Emails Sent | COUNT(*) from email_log table |
| | Push Sent | COUNT(*) from push_log table |
| **Security** | Failed Logins | COUNT(*) from auth logs |
| | API Errors | COUNT(*) from error_log table |
| | DB Size | pg_database_size() |

---

## Getting Started

1. **Team Lead** gathers Juan's actual Supabase schema and shares with all agents
2. **Agent 1** starts immediately on database schema + seed data
3. **Agent 2** starts on Edge Function once schema is confirmed
4. **Agent 3** starts on frontend using seed data (parallel with Agent 2)
5. **Agent 4** starts on auth + infra (parallel with Agents 2 & 3)
6. **Team Lead** reviews each agent's output and runs integration tests
7. **Deploy** to Vercel + configure subdomain