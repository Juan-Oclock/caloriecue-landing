-- ============================================================================
-- Migration 003: Admin Access Logs
--
-- Audit trail for all admin dashboard activity. Tracks who accessed what,
-- when, and from where. Used for security monitoring and compliance.
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_access_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      TEXT NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups by time (most recent first) for log browsing
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_created_desc
  ON admin_access_logs (created_at DESC);

-- Filter logs by specific admin user
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_user_id
  ON admin_access_logs (user_id);
