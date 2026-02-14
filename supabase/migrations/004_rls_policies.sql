-- ============================================================================
-- Migration 004: Row Level Security Policies
--
-- Locks down all dashboard tables so only designated admin users can read,
-- and only the service role (server-side) can write.
--
-- Admin membership is checked via the dashboard_config table, where the
-- 'admin_user_ids' key holds a JSON array of authorized user UUIDs.
-- ============================================================================


-- ── Reusable Admin Check Function ──────────────────────────────────────────
-- SECURITY DEFINER: runs with the privileges of the function owner (bypasses
-- RLS on dashboard_config itself to avoid circular dependency).
-- STABLE: result doesn't change within a single statement, enabling caching.

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM dashboard_config
    WHERE key = 'admin_user_ids'
    AND value @> to_jsonb(check_user_id::text)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================================
-- dashboard_snapshots
-- ============================================================================

ALTER TABLE dashboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Admins can read all snapshots
CREATE POLICY "admins_select_snapshots"
  ON dashboard_snapshots
  FOR SELECT
  USING (is_admin(auth.uid()));

-- No INSERT for authenticated users (service role only)
CREATE POLICY "deny_insert_snapshots"
  ON dashboard_snapshots
  FOR INSERT
  WITH CHECK (false);

-- No UPDATE for authenticated users (service role only)
CREATE POLICY "deny_update_snapshots"
  ON dashboard_snapshots
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- No DELETE for authenticated users (service role only)
CREATE POLICY "deny_delete_snapshots"
  ON dashboard_snapshots
  FOR DELETE
  USING (false);


-- ============================================================================
-- dashboard_config
-- ============================================================================

ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Admins can read configuration
CREATE POLICY "admins_select_config"
  ON dashboard_config
  FOR SELECT
  USING (is_admin(auth.uid()));

-- No INSERT for authenticated users (service role only)
CREATE POLICY "deny_insert_config"
  ON dashboard_config
  FOR INSERT
  WITH CHECK (false);

-- No UPDATE for authenticated users (service role only)
CREATE POLICY "deny_update_config"
  ON dashboard_config
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- No DELETE for authenticated users (service role only)
CREATE POLICY "deny_delete_config"
  ON dashboard_config
  FOR DELETE
  USING (false);


-- ============================================================================
-- admin_access_logs
-- ============================================================================

ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all access logs
CREATE POLICY "admins_select_logs"
  ON admin_access_logs
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can insert new log entries (for server-side audit logging)
CREATE POLICY "admins_insert_logs"
  ON admin_access_logs
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- No UPDATE for anyone (logs are immutable)
CREATE POLICY "deny_update_logs"
  ON admin_access_logs
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

-- No DELETE for anyone (logs are immutable)
CREATE POLICY "deny_delete_logs"
  ON admin_access_logs
  FOR DELETE
  USING (false);
