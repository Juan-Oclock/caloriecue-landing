-- ============================================================================
-- Migration 002: Dashboard Configuration
--
-- Key-value configuration store for the admin dashboard.
-- Stores admin user IDs, snapshot scheduling, and other runtime settings.
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_config (
  id          SERIAL PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Default Configuration ──────────────────────────────────────────────────

-- List of Supabase Auth user IDs that have admin access
INSERT INTO dashboard_config (key, value)
VALUES ('admin_user_ids', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Timestamp of the last successful snapshot computation
INSERT INTO dashboard_config (key, value)
VALUES ('last_snapshot', 'null'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Cron expression for automatic snapshot generation
-- "0 16 * * *" = daily at 4:00 PM UTC = midnight Manila (PHT, UTC+8)
INSERT INTO dashboard_config (key, value)
VALUES ('snapshot_schedule', '"0 16 * * *"'::jsonb)
ON CONFLICT (key) DO NOTHING;
