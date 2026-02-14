'use client';

import { TopBar } from '@/components/admin';

interface TopBarWrapperProps {
  snapshotTime: string | null;
  userEmail?: string;
}

export default function TopBarWrapper({ snapshotTime, userEmail }: TopBarWrapperProps) {
  return <TopBar title="Dashboard" snapshotTime={snapshotTime} userEmail={userEmail} />;
}
