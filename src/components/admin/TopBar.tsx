'use client';

import SnapshotStatus from './SnapshotStatus';
import RefreshButton from './RefreshButton';
import { triggerManualSnapshot } from '@/app/admin/(dashboard)/actions';

interface TopBarProps {
  title: string;
  snapshotTime: string | null;
  userEmail?: string;
}

export default function TopBar({ title, snapshotTime, userEmail }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <SnapshotStatus computedAt={snapshotTime} />
      </div>
      <div className="flex items-center gap-4">
        <RefreshButton onRefresh={triggerManualSnapshot} />
        {userEmail && (
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
        )}
        <form action="/admin/login/actions" method="post">
          <button
            formAction="/api/auth/logout"
            type="button"
            onClick={async () => {
              const { logout } = await import('@/app/admin/login/actions');
              logout();
            }}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
