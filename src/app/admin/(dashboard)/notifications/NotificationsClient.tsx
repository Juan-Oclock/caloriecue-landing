'use client';

import { MetricCard, TrendChart, EmptyState } from '@/components/admin';
import type { DashboardSnapshot } from '@/lib/dashboard-types';

interface NotificationsClientProps {
  latest: DashboardSnapshot | null;
  previous: DashboardSnapshot | null;
  history: DashboardSnapshot[];
}

export default function NotificationsClient({ latest, previous, history }: NotificationsClientProps) {
  if (!latest) {
    return (
      <EmptyState
        title="No data yet"
        description="Trigger a snapshot using the refresh button above, or run the seed SQL."
      />
    );
  }

  const emailOpenRate = latest.emails_sent_today > 0
    ? ((latest.emails_opened_today / latest.emails_sent_today) * 100).toFixed(1)
    : '0.0';
  const pushOpenRate = latest.push_notifications_sent > 0
    ? ((latest.push_notifications_opened / latest.push_notifications_sent) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Notification Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Notifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Emails Sent"
            value={latest.emails_sent_today}
            previousValue={previous?.emails_sent_today}
          />
          <MetricCard
            label="Emails Opened"
            value={latest.emails_opened_today}
            previousValue={previous?.emails_opened_today}
          />
          <MetricCard
            label="Push Sent"
            value={latest.push_notifications_sent}
            previousValue={previous?.push_notifications_sent}
          />
          <MetricCard
            label="Push Opened"
            value={latest.push_notifications_opened}
            previousValue={previous?.push_notifications_opened}
          />
        </div>
      </section>

      {/* Open Rates */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Open Rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Email Open Rate</span>
                <p className="text-sm text-gray-400 mt-0.5">
                  {latest.emails_opened_today.toLocaleString()} / {latest.emails_sent_today.toLocaleString()} emails
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{emailOpenRate}%</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Push Open Rate</span>
                <p className="text-sm text-gray-400 mt-0.5">
                  {latest.push_notifications_opened.toLocaleString()} / {latest.push_notifications_sent.toLocaleString()} notifications
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{pushOpenRate}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bounce & Unsubscribe Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Issues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Emails Bounced"
            value={latest.emails_bounced_today}
            previousValue={previous?.emails_bounced_today}
          />
          <MetricCard
            label="Email Unsubscribes"
            value={latest.email_unsubscribes_today}
            previousValue={previous?.email_unsubscribes_today}
          />
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">30-Day Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart
            data={history}
            dataKey="emails_sent_today"
            title="Emails Sent"
            type="area"
            color="#3B82F6"
          />
          <TrendChart
            data={history}
            dataKey="push_notifications_sent"
            title="Push Notifications Sent"
            type="area"
            color="#8B5CF6"
          />
        </div>
      </section>
    </div>
  );
}
