import { getLatestSnapshot, getPreviousSnapshot, getSnapshotHistory } from '@/lib/dashboard-api';
import RevenueClient from './RevenueClient';

export default async function RevenuePage() {
  const [latest, previous, history] = await Promise.all([
    getLatestSnapshot(),
    getPreviousSnapshot(),
    getSnapshotHistory(30),
  ]);

  return <RevenueClient latest={latest} previous={previous} history={history} />;
}
