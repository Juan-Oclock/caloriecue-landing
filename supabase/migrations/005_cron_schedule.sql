-- ============================================================================
-- Migration 005: Cron Schedule for Daily Snapshot Computation
--
-- Sets up pg_cron to invoke the compute-metrics Edge Function daily at
-- 4:00 PM UTC (midnight Manila, PHT UTC+8).
--
-- Uses pg_net to make an HTTP POST to the Edge Function endpoint.
-- The service_role_key is read from the app.settings PostgreSQL config
-- which Supabase sets automatically.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily snapshot computation at 4PM UTC (midnight Manila)
SELECT cron.schedule(
  'daily-dashboard-snapshot',
  '0 16 * * *',
  $$
  SELECT net.http_post(
    url := 'https://bxhgpvkkeyguovvyqsft.supabase.co/functions/v1/compute-metrics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"scheduled": true}'::jsonb
  );
  $$
);
