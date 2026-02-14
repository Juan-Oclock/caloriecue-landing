'use client';

import { MetricCard, TrendChart, DonutChart, EmptyState } from '@/components/admin';
import type { DashboardSnapshot } from '@/lib/dashboard-types';

interface RevenueClientProps {
  latest: DashboardSnapshot | null;
  previous: DashboardSnapshot | null;
  history: DashboardSnapshot[];
}

export default function RevenueClient({ latest, previous, history }: RevenueClientProps) {
  if (!latest) {
    return (
      <EmptyState
        title="No data yet"
        description="Trigger a snapshot using the refresh button above, or run the seed SQL."
      />
    );
  }

  const subscriberSegments = [
    { name: 'Monthly', value: latest.monthly_subscribers, color: '#3B82F6' },
    { name: 'Yearly', value: latest.yearly_subscribers, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="MRR"
            value={latest.mrr_cents}
            previousValue={previous?.mrr_cents}
            format="currency"
          />
          <MetricCard
            label="ARR"
            value={latest.arr_cents}
            previousValue={previous?.arr_cents}
            format="currency"
          />
          <MetricCard
            label="Revenue Today"
            value={latest.revenue_today_cents}
            previousValue={previous?.revenue_today_cents}
            format="currency"
          />
          <MetricCard
            label="Avg Revenue Per User"
            value={latest.avg_revenue_per_user_cents}
            previousValue={previous?.avg_revenue_per_user_cents}
            format="currency"
          />
        </div>
      </section>

      {/* Subscribers Donut + Subscription Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Subscribers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DonutChart
            segments={subscriberSegments}
            centerLabel="Subscribers"
            title="Monthly vs Yearly"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            <MetricCard
              label="New Subscriptions Today"
              value={latest.new_subscriptions_today}
              previousValue={previous?.new_subscriptions_today}
            />
            <MetricCard
              label="Cancellations Today"
              value={latest.cancellations_today}
              previousValue={previous?.cancellations_today}
            />
            <MetricCard
              label="LTV Estimate"
              value={latest.ltv_estimate_cents}
              previousValue={previous?.ltv_estimate_cents}
              format="currency"
            />
            <MetricCard
              label="Monthly Subscribers"
              value={latest.monthly_subscribers}
              previousValue={previous?.monthly_subscribers}
            />
          </div>
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">30-Day Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart
            data={history}
            dataKey="mrr_cents"
            title="MRR"
            type="area"
            color="#10B981"
            formatValue={(v) => `$${(v / 100).toFixed(0)}`}
          />
          <TrendChart
            data={history}
            dataKey="monthly_subscribers"
            title="Monthly Subscribers"
            type="line"
            color="#3B82F6"
          />
          <TrendChart
            data={history}
            dataKey="yearly_subscribers"
            title="Yearly Subscribers"
            type="line"
            color="#8B5CF6"
          />
          <TrendChart
            data={history}
            dataKey="revenue_today_cents"
            title="Daily Revenue"
            type="bar"
            color="#10B981"
            formatValue={(v) => `$${(v / 100).toFixed(2)}`}
          />
        </div>
      </section>
    </div>
  );
}
