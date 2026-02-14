// =============================================================================
// compute-metrics Edge Function
//
// Computes daily dashboard metric snapshots for the CalorieCue admin dashboard.
// Invoked either by a pg_cron schedule (daily at 4PM UTC / midnight Manila)
// or manually via authenticated POST request.
//
// Authorization: Requires a valid Supabase JWT from a user whose ID is listed
// in the dashboard_config 'admin_user_ids' array.
//
// Runtime: Deno (Supabase Edge Functions)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { computeFunnelMetrics } from './metrics/funnel.ts';
import { computeEngagementMetrics } from './metrics/engagement.ts';
import { computeRevenueMetrics } from './metrics/revenue.ts';
import { computeNotificationMetrics } from './metrics/notifications.ts';
import { computeSecurityMetrics } from './metrics/security.ts';
import { computeSystemMetrics } from './metrics/system.ts';

// ── CORS Headers ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // ── Handle CORS Preflight ────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // ── Only Accept POST ─────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const startTime = Date.now();

    // ── Environment Variables ─────────────────────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ── Verify Authorization ─────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's JWT to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is an admin by querying dashboard_config
    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: configRow, error: configError } = await serviceClient
      .from('dashboard_config')
      .select('value')
      .eq('key', 'admin_user_ids')
      .single();

    if (configError || !configRow) {
      return new Response(
        JSON.stringify({ error: 'Failed to load admin configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminUserIds: string[] = configRow.value as string[];
    if (!adminUserIds.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: user is not an admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Compute All Metrics ──────────────────────────────────────────────
    // Each module is independent and can be updated separately when the
    // CalorieCue app schema is known.
    const [
      funnelMetrics,
      engagementMetrics,
      revenueMetrics,
      notificationMetrics,
      securityMetrics,
      systemMetrics,
    ] = await Promise.all([
      computeFunnelMetrics(serviceClient),
      computeEngagementMetrics(serviceClient),
      computeRevenueMetrics(serviceClient),
      computeNotificationMetrics(serviceClient),
      computeSecurityMetrics(serviceClient),
      computeSystemMetrics(serviceClient),
    ]);

    // ── Build Snapshot ───────────────────────────────────────────────────
    const snapshotDate = new Date().toISOString().split('T')[0];
    const durationMs = Date.now() - startTime;

    // Parse request body for metadata
    let isScheduled = false;
    try {
      const body = await req.json();
      isScheduled = body?.scheduled === true;
    } catch {
      // No body or invalid JSON - that's fine, treat as manual trigger
    }

    const snapshot = {
      snapshot_date: snapshotDate,
      computed_at: new Date().toISOString(),
      ...funnelMetrics,
      ...engagementMetrics,
      ...revenueMetrics,
      ...notificationMetrics,
      ...securityMetrics,
      ...systemMetrics,
      notes: isScheduled ? 'Scheduled daily computation' : 'Manual trigger',
      is_manual_trigger: !isScheduled,
      computation_duration_ms: durationMs,
    };

    // ── Insert Snapshot ──────────────────────────────────────────────────
    // Use upsert with snapshot_date as the conflict target so re-running
    // on the same day updates rather than fails.
    const { error: insertError } = await serviceClient
      .from('dashboard_snapshots')
      .upsert(snapshot, { onConflict: 'snapshot_date' });

    if (insertError) {
      console.error('Failed to insert snapshot:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save snapshot', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Update last_snapshot timestamp ────────────────────────────────────
    const { error: updateError } = await serviceClient
      .from('dashboard_config')
      .update({ value: JSON.stringify(new Date().toISOString()), updated_at: new Date().toISOString() })
      .eq('key', 'last_snapshot');

    if (updateError) {
      console.warn('Failed to update last_snapshot config:', updateError);
      // Non-fatal - the snapshot was still saved
    }

    // ── Return Success ───────────────────────────────────────────────────
    const totalDurationMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        snapshot_date: snapshotDate,
        duration_ms: totalDurationMs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error in compute-metrics:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
