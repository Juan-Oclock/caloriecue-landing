export interface DashboardSnapshot {
  id: string;
  snapshot_date: string;
  computed_at: string;

  // User Funnel
  total_signups: number;
  new_signups_today: number;
  email_verified_users: number;
  onboarding_completed: number;
  active_trial_users: number;
  trial_to_paid_conversions: number;
  total_paid_users: number;
  churned_users: number;
  reactivated_users: number;

  // Engagement
  dau: number;
  wau: number;
  mau: number;
  meals_logged_today: number;
  photo_scans_today: number;
  barcode_scans_today: number;
  manual_logs_today: number;
  ai_coach_messages_today: number;
  avg_session_duration_sec: number;
  feature_usage_json: Record<string, number>;

  // Revenue
  mrr_cents: number;
  arr_cents: number;
  monthly_subscribers: number;
  yearly_subscribers: number;
  new_subscriptions_today: number;
  cancellations_today: number;
  revenue_today_cents: number;
  avg_revenue_per_user_cents: number;
  ltv_estimate_cents: number;

  // Notifications
  emails_sent_today: number;
  emails_opened_today: number;
  emails_bounced_today: number;
  push_notifications_sent: number;
  push_notifications_opened: number;
  email_unsubscribes_today: number;

  // Security
  failed_login_attempts: number;
  api_errors_today: number;
  avg_api_response_ms: number;
  db_size_mb: number;
  storage_size_mb: number;
  suspicious_activity_count: number;
  rate_limited_requests: number;

  // App Store
  app_store_rating: number;
  app_store_reviews_count: number;
  app_store_downloads_today: number;

  // Metadata
  notes: string;
  is_manual_trigger: boolean;
  computation_duration_ms: number;
  created_at: string;
}

export type MetricTrend = 'up' | 'down' | 'flat';

export interface MetricCardData {
  label: string;
  value: number;
  previousValue?: number;
  format: 'number' | 'currency' | 'percent' | 'duration';
  trend?: MetricTrend;
  trendPercent?: number;
}
