import { getLatestSnapshot, getPreviousSnapshot, getSnapshotHistory } from '@/lib/dashboard-api';
import FunnelClient from './FunnelClient';

export default async function FunnelPage() {
  const [latest, previous, history] = await Promise.all([
    getLatestSnapshot(),
    getPreviousSnapshot(),
    getSnapshotHistory(30),
  ]);

  return <FunnelClient latest={latest} previous={previous} history={history} />;
}
