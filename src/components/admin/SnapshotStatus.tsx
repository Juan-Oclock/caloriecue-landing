'use client';

interface SnapshotStatusProps {
  computedAt: string | null;
}

export default function SnapshotStatus({ computedAt }: SnapshotStatusProps) {
  if (!computedAt) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-300" />
        No snapshots yet
      </div>
    );
  }

  const date = new Date(computedAt);
  const now = new Date();
  const hoursSince = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  let dotColor = 'bg-emerald-500';
  if (hoursSince > 48) dotColor = 'bg-red-500';
  else if (hoursSince > 26) dotColor = 'bg-amber-500';

  const timeStr = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      Last snapshot: {timeStr}
    </div>
  );
}
