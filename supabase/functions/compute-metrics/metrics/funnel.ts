// =============================================================================
// Funnel Metrics - User acquisition and conversion pipeline
//
// Tracks the full user lifecycle: signup -> verification -> onboarding ->
// trial -> paid -> churn/reactivation.
//
// TODO: Replace stub returns with actual queries once the CalorieCue app
// database schema is finalized.
// =============================================================================

export async function computeFunnelMetrics(client: any) {
  // TODO: Replace with actual queries when app schema is known
  //
  // Example queries that would be used:
  //
  // const { count: totalSignups } = await client
  //   .from('users')
  //   .select('*', { count: 'exact', head: true });
  //
  // const { count: newSignupsToday } = await client
  //   .from('users')
  //   .select('*', { count: 'exact', head: true })
  //   .gte('created_at', new Date().toISOString().split('T')[0]);
  //
  // const { count: verifiedUsers } = await client
  //   .from('users')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('email_verified', true);
  //
  // const { count: onboardingCompleted } = await client
  //   .from('users')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('onboarding_complete', true);
  //
  // const { count: activeTrialUsers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'trialing')
  //   .gte('trial_end', new Date().toISOString());
  //
  // const { count: trialToPaid } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'active')
  //   .gte('converted_at', new Date().toISOString().split('T')[0]);
  //
  // const { count: totalPaidUsers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'active');
  //
  // const { count: churnedUsers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'canceled');
  //
  // const { count: reactivatedUsers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'active')
  //   .not('canceled_at', 'is', null);

  return {
    total_signups: 0,
    new_signups_today: 0,
    email_verified_users: 0,
    onboarding_completed: 0,
    active_trial_users: 0,
    trial_to_paid_conversions: 0,
    total_paid_users: 0,
    churned_users: 0,
    reactivated_users: 0,
  };
}
