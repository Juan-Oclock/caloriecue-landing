'use client';

import { MetricCard, TrendChart, FunnelChart, EmptyState } from '@/components/admin';
import type { DashboardSnapshot } from '@/lib/dashboard-types';

interface FunnelClientProps {
  latest: DashboardSnapshot | null;
  previous: DashboardSnapshot | null;
  history: DashboardSnapshot[];
}

export default function FunnelClient({ latest, previous, history }: FunnelClientProps) {
  if (!latest) {
    return (
      <EmptyState
        title="No data yet"
        description="Trigger a snapshot using the refresh button above, or run the seed SQL."
      />
    );
  }

  const funnelSteps = [
    { label: 'Total Signups', value: latest.total_signups },
    { label: 'Email Verified', value: latest.email_verified_users },
    { label: 'Onboarding Complete', value: latest.onboarding_completed },
    { label: 'Active Trial', value: latest.active_trial_users },
    { label: 'Paid Users', value: latest.total_paid_users },
  ];

  const verifiedRate = latest.total_signups > 0
    ? ((latest.email_verified_users / latest.total_signups) * 100).toFixed(1)
    : '0.0';
  const paidRate = latest.total_signups > 0
    ? ((latest.total_paid_users / latest.total_signups) * 100).toFixed(1)
    : '0.0';
  const trialToPaidRate = latest.active_trial_users > 0
    ? ((latest.trial_to_paid_conversions / latest.active_trial_users) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">User Funnel</h2>
        <FunnelChart steps={funnelSteps} title="Signup to Paid Conversion Funnel" />
      </section>

      {/* Conversion Rate Summary */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Conversion Rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-sm text-gray-500">Verified / Signups</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{verifiedRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-sm text-gray-500">Trial &rarr; Paid</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{trialToPaidRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-sm text-gray-500">Paid / Total Signups</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{paidRate}%</p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Funnel Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="New Signups Today"
            value={latest.new_signups_today}
            previousValue={previous?.new_signups_today}
          />
          <MetricCard
            label="Trial to Paid"
            value={latest.trial_to_paid_conversions}
            previousValue={previous?.trial_to_paid_conversions}
          />
          <MetricCard
            label="Churned Users"
            value={latest.churned_users}
            previousValue={previous?.churned_users}
          />
          <MetricCard
            label="Reactivated Users"
            value={latest.reactivated_users}
            previousValue={previous?.reactivated_users}
          />
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">30-Day Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart
            data={history}
            dataKey="total_signups"
            title="Total Signups"
            type="line"
            color="#E05A3A"
          />
          <TrendChart
            data={history}
            dataKey="total_paid_users"
            title="Total Paid Users"
            type="area"
            color="#3B82F6"
          />
        </div>
      </section>
    </div>
  );
}
