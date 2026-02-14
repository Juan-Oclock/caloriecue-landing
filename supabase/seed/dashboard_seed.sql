-- ============================================================================
-- Seed: 30 Days of Dashboard Snapshots
--
-- Generates realistic metric data from 30 days ago through yesterday.
-- Idempotent: uses ON CONFLICT DO NOTHING so it can be re-run safely.
--
-- Data characteristics:
--   - Gradual user growth (total_signups ~450 -> ~530)
--   - Weekend dips in engagement (DAU, meals logged, photo scans)
--   - MRR growth from ~$200 to ~$350 (20000 -> 35000 cents)
--   - Natural randomness to avoid perfectly linear trends
--   - Realistic ratios between related metrics
-- ============================================================================

INSERT INTO dashboard_snapshots (
  snapshot_date,
  computed_at,

  -- User Funnel
  total_signups,
  new_signups_today,
  email_verified_users,
  onboarding_completed,
  active_trial_users,
  trial_to_paid_conversions,
  total_paid_users,
  churned_users,
  reactivated_users,

  -- Engagement
  dau,
  wau,
  mau,
  meals_logged_today,
  photo_scans_today,
  barcode_scans_today,
  manual_logs_today,
  ai_coach_messages_today,
  avg_session_duration_sec,
  feature_usage_json,

  -- Revenue
  mrr_cents,
  arr_cents,
  monthly_subscribers,
  yearly_subscribers,
  new_subscriptions_today,
  cancellations_today,
  revenue_today_cents,
  avg_revenue_per_user_cents,
  ltv_estimate_cents,

  -- Notifications
  emails_sent_today,
  emails_opened_today,
  emails_bounced_today,
  push_notifications_sent,
  push_notifications_opened,
  email_unsubscribes_today,

  -- Security
  failed_login_attempts,
  api_errors_today,
  avg_api_response_ms,
  db_size_mb,
  storage_size_mb,
  suspicious_activity_count,
  rate_limited_requests,

  -- App Store
  app_store_rating,
  app_store_reviews_count,
  app_store_downloads_today,

  -- Metadata
  notes,
  is_manual_trigger,
  computation_duration_ms
)
SELECT
  d                                                           AS snapshot_date,
  d + INTERVAL '16 hours' + (random() * INTERVAL '30 minutes') AS computed_at,

  -- ── day_num: 0..29 (used for gradual growth) ────────────────────────────
  -- ── is_weekend: 0=weekday, 1=weekend (for engagement dips) ──────────────
  -- These are computed inline below using:
  --   day_num   = (d - (CURRENT_DATE - INTERVAL '30 days'))::int
  --   is_wknd   = CASE WHEN EXTRACT(dow FROM d) IN (0,6) THEN 1 ELSE 0 END
  --   wknd_mult = 1.0 - 0.35 * is_wknd  (weekends see ~35% less activity)

  -- ── User Funnel ──────────────────────────────────────────────────────────
  -- total_signups: gradual growth from ~450 to ~530
  (450 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 2.7)::int
       + (random() * 4 - 2)::int)::int,

  -- new_signups_today: 2-5 per day, slightly less on weekends
  GREATEST(1, (
    CASE WHEN EXTRACT(dow FROM d) IN (0,6)
      THEN 2 + (random() * 2)::int
      ELSE 3 + (random() * 3)::int
    END
  ))::int,

  -- email_verified_users: ~85-90% of total signups
  (450 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 2.7)::int
       + (random() * 4 - 2)::int)::int
    * (85 + (random() * 5)::int)::int / 100,

  -- onboarding_completed: ~70-80% of total signups
  (450 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 2.7)::int)::int
    * (70 + (random() * 10)::int)::int / 100,

  -- active_trial_users: 20-50, slight growth
  (20 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.8)::int
      + (random() * 10 - 5)::int),

  -- trial_to_paid_conversions: 0-3 per day
  (random() * 3)::int,

  -- total_paid_users: growing from ~55 to ~90
  (55 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 1.2)::int
      + (random() * 4 - 2)::int),

  -- churned_users: cumulative, slow growth 5-15
  (5 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.3)::int
     + (random() * 2)::int),

  -- reactivated_users: 0-1 per day
  (random() * 1.5)::int,

  -- ── Engagement ───────────────────────────────────────────────────────────
  -- dau: 30-80, weekends ~35% lower
  GREATEST(25, (
    CASE WHEN EXTRACT(dow FROM d) IN (0,6)
      THEN 30 + (random() * 20)::int
      ELSE 45 + (random() * 35)::int
    END
    + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.5)::int
  ))::int,

  -- wau: 120-200
  (120 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 2.2)::int
       + (random() * 20 - 10)::int),

  -- mau: 300-450
  (300 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 4.5)::int
       + (random() * 30 - 15)::int),

  -- meals_logged_today: 100-400, weekends ~30% lower
  GREATEST(80, (
    CASE WHEN EXTRACT(dow FROM d) IN (0,6)
      THEN 100 + (random() * 120)::int
      ELSE 180 + (random() * 220)::int
    END
    + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 3)::int
  ))::int,

  -- photo_scans_today: 60-250, weekends lower
  GREATEST(40, (
    CASE WHEN EXTRACT(dow FROM d) IN (0,6)
      THEN 60 + (random() * 80)::int
      ELSE 100 + (random() * 150)::int
    END
    + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 2)::int
  ))::int,

  -- barcode_scans_today: 20-80
  (20 + (random() * 60)::int
      + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.5)::int),

  -- manual_logs_today: 15-60
  (15 + (random() * 45)::int),

  -- ai_coach_messages_today: 10-80, growing as feature gains traction
  GREATEST(5, (
    10 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 1.5)::int
       + (random() * 25 - 10)::int
  ))::int,

  -- avg_session_duration_sec: 180-420 seconds (3-7 minutes)
  ROUND((180 + random() * 240)::numeric, 2),

  -- feature_usage_json: breakdown of feature usage
  jsonb_build_object(
    'meal_logging',    (40 + (random() * 30)::int),
    'photo_scan',      (25 + (random() * 20)::int),
    'barcode_scan',    (10 + (random() * 15)::int),
    'ai_coach',        (5  + (random() * 15)::int),
    'meal_planning',   (8  + (random() * 12)::int),
    'progress_charts', (12 + (random() * 10)::int)
  ),

  -- ── Revenue ──────────────────────────────────────────────────────────────
  -- mrr_cents: growing from ~$200 (20000) to ~$350 (35000)
  (20000 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 520)::int
         + (random() * 1000 - 500)::int),

  -- arr_cents: mrr * 12 with slight discount factor (~11.5x)
  ((20000 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 520)::int) * 11.5)::int
    + (random() * 5000 - 2500)::int,

  -- monthly_subscribers: 40-70
  (40 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.9)::int
      + (random() * 6 - 3)::int),

  -- yearly_subscribers: 15-30
  (15 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.45)::int
      + (random() * 4 - 2)::int),

  -- new_subscriptions_today: 0-3
  (random() * 3.5)::int,

  -- cancellations_today: 0-1
  (random() * 1.8)::int,

  -- revenue_today_cents: daily revenue ~$5-$20
  (500 + (random() * 1500)::int
       + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 15)::int),

  -- avg_revenue_per_user_cents: ~$3-$5 per user
  (300 + (random() * 200)::int
       + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 3)::int),

  -- ltv_estimate_cents: ~$50-$80
  (5000 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 60)::int
        + (random() * 800 - 400)::int),

  -- ── Notifications ────────────────────────────────────────────────────────
  -- emails_sent_today: 20-80
  (20 + (random() * 60)::int),

  -- emails_opened_today: ~40-60% of sent
  ((20 + (random() * 60)::int) * (40 + (random() * 20)::int) / 100),

  -- emails_bounced_today: 0-3
  (random() * 3)::int,

  -- push_notifications_sent: 30-120
  (30 + (random() * 90)::int),

  -- push_notifications_opened: ~25-45% of sent
  ((30 + (random() * 90)::int) * (25 + (random() * 20)::int) / 100),

  -- email_unsubscribes_today: 0-2
  (random() * 2.5)::int,

  -- ── Security ─────────────────────────────────────────────────────────────
  -- failed_login_attempts: 0-5
  (random() * 5)::int,

  -- api_errors_today: 0-10
  (random() * 10)::int,

  -- avg_api_response_ms: 45-150ms
  ROUND((45 + random() * 105)::numeric, 2),

  -- db_size_mb: slowly growing from ~120 to ~145
  ROUND((120 + (d - (CURRENT_DATE - INTERVAL '30 days'))::int * 0.85
             + random() * 2)::numeric, 2),

  -- storage_size_mb: growing from ~250 to ~310 (photos take space)
  ROUND((250 + (d - (CURRENT_DATE - INTERVAL '30 days'))::int * 2.1
             + random() * 5)::numeric, 2),

  -- suspicious_activity_count: 0-2
  (random() * 2.2)::int,

  -- rate_limited_requests: 0-8
  (random() * 8)::int,

  -- ── App Store ────────────────────────────────────────────────────────────
  -- app_store_rating: 4.6-4.8
  ROUND((4.6 + random() * 0.2)::numeric, 2),

  -- app_store_reviews_count: cumulative, growing from ~180 to ~220
  (180 + ((d - (CURRENT_DATE - INTERVAL '30 days'))::int * 1.3)::int
       + (random() * 3 - 1)::int),

  -- app_store_downloads_today: 5-25
  GREATEST(3, (
    CASE WHEN EXTRACT(dow FROM d) IN (0,6)
      THEN 5 + (random() * 10)::int
      ELSE 8 + (random() * 17)::int
    END
  ))::int,

  -- ── Metadata ─────────────────────────────────────────────────────────────
  '',        -- notes
  false,     -- is_manual_trigger
  (800 + (random() * 600)::int)  -- computation_duration_ms: 800-1400ms

FROM generate_series(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '1 day',
  INTERVAL '1 day'
) AS d

ON CONFLICT (snapshot_date) DO NOTHING;
