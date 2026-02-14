// =============================================================================
// Engagement Metrics - User activity and feature usage
//
// Tracks daily/weekly/monthly active users, meal logging activity across
// input methods (photo, barcode, manual), AI coach usage, and session duration.
//
// TODO: Replace stub returns with actual queries once the CalorieCue app
// database schema is finalized.
// =============================================================================

export async function computeEngagementMetrics(client: any) {
  const today = new Date().toISOString().split('T')[0];

  // TODO: Replace with actual queries when app schema is known
  //
  // -- Daily Active Users: distinct users with any activity today
  // const { count: dau } = await client
  //   .from('user_activity')
  //   .select('user_id', { count: 'exact', head: true })
  //   .gte('created_at', today);
  //
  // -- Weekly Active Users: distinct users active in last 7 days
  // const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  // const { count: wau } = await client
  //   .from('user_activity')
  //   .select('user_id', { count: 'exact', head: true })
  //   .gte('created_at', weekAgo);
  //
  // -- Monthly Active Users: distinct users active in last 30 days
  // const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  // const { count: mau } = await client
  //   .from('user_activity')
  //   .select('user_id', { count: 'exact', head: true })
  //   .gte('created_at', monthAgo);
  //
  // -- Meals logged today (total across all methods)
  // const { count: mealsLoggedToday } = await client
  //   .from('meal_logs')
  //   .select('*', { count: 'exact', head: true })
  //   .gte('created_at', today);
  //
  // -- Photo scans today
  // const { count: photoScansToday } = await client
  //   .from('meal_logs')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('input_method', 'photo')
  //   .gte('created_at', today);
  //
  // -- Barcode scans today
  // const { count: barcodeScansToday } = await client
  //   .from('meal_logs')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('input_method', 'barcode')
  //   .gte('created_at', today);
  //
  // -- Manual logs today
  // const { count: manualLogsToday } = await client
  //   .from('meal_logs')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('input_method', 'manual')
  //   .gte('created_at', today);
  //
  // -- AI coach messages today
  // const { count: aiCoachMessagesToday } = await client
  //   .from('ai_coach_messages')
  //   .select('*', { count: 'exact', head: true })
  //   .gte('created_at', today);
  //
  // -- Average session duration (seconds)
  // const { data: sessionData } = await client
  //   .from('sessions')
  //   .select('duration_sec')
  //   .gte('created_at', today);
  // const avgSessionDuration = sessionData?.length
  //   ? sessionData.reduce((sum: number, s: any) => sum + s.duration_sec, 0) / sessionData.length
  //   : 0;
  //
  // -- Feature usage breakdown
  // const { data: featureUsage } = await client
  //   .rpc('get_feature_usage_breakdown', { target_date: today });

  return {
    dau: 0,
    wau: 0,
    mau: 0,
    meals_logged_today: 0,
    photo_scans_today: 0,
    barcode_scans_today: 0,
    manual_logs_today: 0,
    ai_coach_messages_today: 0,
    avg_session_duration_sec: 0,
    feature_usage_json: {},
  };
}
