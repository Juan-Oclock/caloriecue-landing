import { Suspense } from 'react';
import { verifyAdmin } from '@/lib/admin-auth';
import { getLatestSnapshot } from '@/lib/dashboard-api';
import { Sidebar, DashboardSkeleton } from '@/components/admin';
import TopBarWrapper from './TopBarWrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifyAdmin();
  const snapshot = await getLatestSnapshot();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-60">
        <Suspense fallback={null}>
          <TopBarWrapper
            snapshotTime={snapshot?.computed_at ?? null}
            userEmail={user.email}
          />
        </Suspense>
        <main className="p-6">
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
