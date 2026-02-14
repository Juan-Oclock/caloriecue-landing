'use client';

import { MetricCard, TrendChart } from '@/components/admin';
import type { DashboardSnapshot } from '@/lib/dashboard-types';

interface OverviewClientProps {
  latest: DashboardSnapshot | null;
  previous: DashboardSnapshot | null;
  history: DashboardSnapshot[];
}

export default function OverviewClient({ latest, previous, history }: OverviewClientProps) {
  if (!latest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h2>
          <p className="text-sm text-gray-500">
            Trigger a snapshot using the refresh button above, or run the seed SQL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Signups"
            value={latest.total_signups}
            previousValue={previous?.total_signups}
          />
          <MetricCard
            label="DAU"
            value={latest.dau}
            previousValue={previous?.dau}
          />
          <MetricCard
            label="MRR"
            value={latest.mrr_cents}
            previousValue={previous?.mrr_cents}
            format="currency"
          />
          <MetricCard
            label="Paid Users"
            value={latest.total_paid_users}
            previousValue={previous?.total_paid_users}
          />
        </div>
      </section>

      {/* Engagement Cards */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Engagement</h2>
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
            label="AI Coach Messages"
            value={latest.ai_coach_messages_today}
            previousValue={previous?.ai_coach_messages_today}
          />
          <MetricCard
            label="Avg Session"
            value={latest.avg_session_duration_sec}
            previousValue={previous?.avg_session_duration_sec}
            format="duration"
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
            color="#3B82F6"
          />
          <TrendChart
            data={history}
            dataKey="meals_logged_today"
            title="Meals Logged"
            color="#E05A3A"
          />
          <TrendChart
            data={history}
            dataKey="mrr_cents"
            title="MRR"
            color="#10B981"
            formatValue={(v) => `$${(v / 100).toFixed(0)}`}
          />
          <TrendChart
            data={history}
            dataKey="total_signups"
            title="Total Signups"
            color="#8B5CF6"
            type="line"
          />
        </div>
      </section>

      {/* Recent Snapshots Table */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Recent Snapshots</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Signups</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">DAU</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Meals</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">MRR</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Errors</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-7).reverse().map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {new Date(s.snapshot_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.new_signups_today}</td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.dau}</td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.meals_logged_today}</td>
                    <td className="text-right px-4 py-3 text-gray-700">
                      ${(s.mrr_cents / 100).toFixed(0)}
                    </td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.total_paid_users}</td>
                    <td className="text-right px-4 py-3 text-gray-700">{s.api_errors_today}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
