'use client';

import { MetricCard, TrendChart, EmptyState } from '@/components/admin';
import type { DashboardSnapshot } from '@/lib/dashboard-types';

interface SecurityClientProps {
  latest: DashboardSnapshot | null;
  previous: DashboardSnapshot | null;
  history: DashboardSnapshot[];
}

function getHealthStatus(apiErrors: number, avgResponseMs: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (apiErrors < 5 && avgResponseMs < 200) {
    return { label: 'Healthy', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' };
  }
  if (apiErrors < 20 && avgResponseMs < 500) {
    return { label: 'Degraded', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' };
  }
  return { label: 'Unhealthy', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' };
}

export default function SecurityClient({ latest, previous, history }: SecurityClientProps) {
  if (!latest) {
    return (
      <EmptyState
        title="No data yet"
        description="Trigger a snapshot using the refresh button above, or run the seed SQL."
      />
    );
  }

  const health = getHealthStatus(latest.api_errors_today, latest.avg_api_response_ms);

  return (
    <div className="space-y-6">
      {/* Suspicious Activity Warning */}
      {latest.suspicious_activity_count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">
              Suspicious Activity Detected
            </h3>
            <p className="text-sm text-amber-700 mt-0.5">
              {latest.suspicious_activity_count} suspicious {latest.suspicious_activity_count === 1 ? 'event' : 'events'} detected. Review security logs for details.
            </p>
          </div>
        </div>
      )}

      {/* System Health Indicator */}
      <section>
        <div className={`rounded-xl border p-5 ${health.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">System Health</span>
              <p className="text-sm text-gray-400 mt-0.5">
                Based on API errors and response time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${
                health.label === 'Healthy' ? 'bg-emerald-500' :
                health.label === 'Degraded' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span className={`text-lg font-bold ${health.color}`}>{health.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Security &amp; Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Failed Login Attempts"
            value={latest.failed_login_attempts}
            previousValue={previous?.failed_login_attempts}
          />
          <MetricCard
            label="API Errors Today"
            value={latest.api_errors_today}
            previousValue={previous?.api_errors_today}
          />
          <MetricCard
            label="Avg API Response"
            value={latest.avg_api_response_ms}
            previousValue={previous?.avg_api_response_ms}
          />
          <MetricCard
            label="Rate Limited Requests"
            value={latest.rate_limited_requests}
            previousValue={previous?.rate_limited_requests}
          />
        </div>
      </section>

      {/* Infrastructure Metrics */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Infrastructure</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-sm text-gray-500">Database Size</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {latest.db_size_mb.toLocaleString()} <span className="text-sm font-normal text-gray-500">MB</span>
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-sm text-gray-500">Storage Size</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {latest.storage_size_mb.toLocaleString()} <span className="text-sm font-normal text-gray-500">MB</span>
            </p>
          </div>
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">30-Day Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart
            data={history}
            dataKey="api_errors_today"
            title="API Errors"
            type="bar"
            color="#EF4444"
          />
          <TrendChart
            data={history}
            dataKey="avg_api_response_ms"
            title="Avg API Response Time"
            type="line"
            color="#F59E0B"
            formatValue={(v) => `${v.toFixed(0)}ms`}
          />
        </div>
      </section>
    </div>
  );
}
