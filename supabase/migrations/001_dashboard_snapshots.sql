-- ============================================================================
-- Migration 001: Dashboard Snapshots
--
-- Flat table storing daily metric snapshots for the CalorieCue admin dashboard.
-- Each row represents one day's worth of aggregated metrics across all
-- categories: user funnel, engagement, revenue, notifications, security,
-- and app store performance.
--
-- Monetary values are stored in cents (INTEGER) to avoid floating-point issues.
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_snapshots (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date               DATE NOT NULL UNIQUE,
  computed_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- ── User Funnel ──────────────────────────────────────────────────────────
  total_signups               INTEGER DEFAULT 0,
  new_signups_today           INTEGER DEFAULT 0,
  email_verified_users        INTEGER DEFAULT 0,
  onboarding_completed        INTEGER DEFAULT 0,
  active_trial_users          INTEGER DEFAULT 0,
  trial_to_paid_conversions   INTEGER DEFAULT 0,
  total_paid_users            INTEGER DEFAULT 0,
  churned_users               INTEGER DEFAULT 0,
  reactivated_users           INTEGER DEFAULT 0,

  -- ── Engagement ───────────────────────────────────────────────────────────
  dau                         INTEGER DEFAULT 0,
  wau                         INTEGER DEFAULT 0,
  mau                         INTEGER DEFAULT 0,
  meals_logged_today          INTEGER DEFAULT 0,
  photo_scans_today           INTEGER DEFAULT 0,
  barcode_scans_today         INTEGER DEFAULT 0,
  manual_logs_today           INTEGER DEFAULT 0,
  ai_coach_messages_today     INTEGER DEFAULT 0,
  avg_session_duration_sec    NUMERIC(8,2) DEFAULT 0,
  feature_usage_json          JSONB DEFAULT '{}'::jsonb,

  -- ── Revenue ──────────────────────────────────────────────────────────────
  mrr_cents                   INTEGER DEFAULT 0,
  arr_cents                   INTEGER DEFAULT 0,
  monthly_subscribers         INTEGER DEFAULT 0,
  yearly_subscribers          INTEGER DEFAULT 0,
  new_subscriptions_today     INTEGER DEFAULT 0,
  cancellations_today         INTEGER DEFAULT 0,
  revenue_today_cents         INTEGER DEFAULT 0,
  avg_revenue_per_user_cents  INTEGER DEFAULT 0,
  ltv_estimate_cents          INTEGER DEFAULT 0,

  -- ── Notifications ────────────────────────────────────────────────────────
  emails_sent_today           INTEGER DEFAULT 0,
  emails_opened_today         INTEGER DEFAULT 0,
  emails_bounced_today        INTEGER DEFAULT 0,
  push_notifications_sent     INTEGER DEFAULT 0,
  push_notifications_opened   INTEGER DEFAULT 0,
  email_unsubscribes_today    INTEGER DEFAULT 0,

  -- ── Security ─────────────────────────────────────────────────────────────
  failed_login_attempts       INTEGER DEFAULT 0,
  api_errors_today            INTEGER DEFAULT 0,
  avg_api_response_ms         NUMERIC(8,2) DEFAULT 0,
  db_size_mb                  NUMERIC(10,2) DEFAULT 0,
  storage_size_mb             NUMERIC(10,2) DEFAULT 0,
  suspicious_activity_count   INTEGER DEFAULT 0,
  rate_limited_requests       INTEGER DEFAULT 0,

  -- ── App Store ────────────────────────────────────────────────────────────
  app_store_rating            NUMERIC(3,2) DEFAULT 0,
  app_store_reviews_count     INTEGER DEFAULT 0,
  app_store_downloads_today   INTEGER DEFAULT 0,

  -- ── Metadata ─────────────────────────────────────────────────────────────
  notes                       TEXT DEFAULT '',
  is_manual_trigger           BOOLEAN DEFAULT false,
  computation_duration_ms     INTEGER DEFAULT 0,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups by date (most recent first)
CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_date_desc
  ON dashboard_snapshots (snapshot_date DESC);
