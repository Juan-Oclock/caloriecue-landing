'use client';

import { MetricCard, TrendChart, EmptyState } from '@/components/admin';
import type { DashboardSnapshot } from '@/lib/dashboard-types';

interface EngagementClientProps {
  latest: DashboardSnapshot | null;
  previous: DashboardSnapshot | null;
  history: DashboardSnapshot[];
}

export default function EngagementClient({ latest, previous, history }: EngagementClientProps) {
  if (!latest) {
    return (
      <EmptyState
        title="No data yet"
        description="Trigger a snapshot using the refresh button above, or run the seed SQL."
      />
    );
  }

  const ghostUserRate = latest.mau > 0
    ? (((latest.mau - latest.dau) / latest.mau) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Active Users */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Active Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="DAU"
            value={latest.dau}
            previousValue={previous?.dau}
          />
          <MetricCard
            label="WAU"
            value={latest.wau}
            previousValue={previous?.wau}
          />
          <MetricCard
            label="MAU"
            value={latest.mau}
            previousValue={previous?.mau}
          />
          <MetricCard
            label="Avg Session Duration"
            value={latest.avg_session_duration_sec}
            previousValue={previous?.avg_session_duration_sec}
            format="duration"
          />
        </div>
      </section>

      {/* Ghost User Rate */}
      <section>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Ghost User Rate</span>
              <p className="text-sm text-gray-400 mt-0.5">Users in MAU but not in DAU</p>
            </div>
            <span className="text-2xl font-bold text-gray-900">{ghostUserRate}%</span>
          </div>
        </div>
      </section>

      {/* Activity Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Today&apos;s Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Meals Logged"
            value={latest.meals_logged_today}
            previousValue={previous?.meals_logged_today}
          />
          <MetricCard
            label="Photo Scans"
            value={latest.photo_scans_today}
            previousValue={previous?.photo_scans_today}
          />
          <MetricCard
            label="Barcode Scans"
            value={latest.barcode_scans_today}
            previousValue={previous?.barcode_scans_today}
          />
          <MetricCard
            label="AI Coach Messages"
            value={latest.ai_coach_messages_today}
            previousValue={previous?.ai_coach_messages_today}
          />
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">30-Day Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart
            data={history}
            dataKey="dau"
            title="Daily Active Users"
            type="area"
            color="#3B82F6"
          />
          <TrendChart
            data={history}
            dataKey="meals_logged_today"
            title="Meals Logged"
            type="bar"
            color="#E05A3A"
          />
        </div>
      </section>
    </div>
  );
}
