'use client';

interface MetricCardProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent' | 'duration';
  icon?: React.ReactNode;
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return `$${(value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'duration':
      if (value >= 3600) return `${(value / 3600).toFixed(1)}h`;
      if (value >= 60) return `${Math.round(value / 60)}m`;
      return `${Math.round(value)}s`;
    default:
      return value.toLocaleString('en-US');
  }
}

function getTrend(current: number, previous: number): { direction: 'up' | 'down' | 'flat'; percent: number } {
  if (previous === 0) return { direction: current > 0 ? 'up' : 'flat', percent: 0 };
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.5) return { direction: 'flat', percent: 0 };
  return { direction: change > 0 ? 'up' : 'down', percent: Math.abs(change) };
}

export default function MetricCard({ label, value, previousValue, format = 'number', icon }: MetricCardProps) {
  const trend = previousValue !== undefined ? getTrend(value, previousValue) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{formatValue(value, format)}</span>
        {trend && trend.direction !== 'flat' && (
          <span
            className={`inline-flex items-center text-xs font-medium mb-0.5 ${
              trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {trend.direction === 'up' ? (
              <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
              </svg>
            )}
            {trend.percent.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
