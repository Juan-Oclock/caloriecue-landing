import { getLatestSnapshot, getPreviousSnapshot, getSnapshotHistory } from '@/lib/dashboard-api';
import OverviewClient from './OverviewClient';

export default async function AdminOverviewPage() {
  const [latest, previous, history] = await Promise.all([
    getLatestSnapshot(),
    getPreviousSnapshot(),
    getSnapshotHistory(30),
  ]);

  return <OverviewClient latest={latest} previous={previous} history={history} />;
}
