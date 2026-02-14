import { getLatestSnapshot, getPreviousSnapshot, getSnapshotHistory } from '@/lib/dashboard-api';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const [latest, previous, history] = await Promise.all([
    getLatestSnapshot(),
    getPreviousSnapshot(),
    getSnapshotHistory(30),
  ]);

  return <NotificationsClient latest={latest} previous={previous} history={history} />;
}
