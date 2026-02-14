'use client';

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-32 bg-gray-200 rounded" />
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="bg-gray-100 rounded" style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <div className="h-4 w-full bg-gray-200 rounded" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-gray-50">
          <div className="h-4 w-full bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton />
    </div>
  );
}
