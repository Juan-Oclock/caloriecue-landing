import { getLatestSnapshot, getPreviousSnapshot, getSnapshotHistory } from '@/lib/dashboard-api';
import EngagementClient from './EngagementClient';

export default async function EngagementPage() {
  const [latest, previous, history] = await Promise.all([
    getLatestSnapshot(),
    getPreviousSnapshot(),
    getSnapshotHistory(30),
  ]);

  return <EngagementClient latest={latest} previous={previous} history={history} />;
}
