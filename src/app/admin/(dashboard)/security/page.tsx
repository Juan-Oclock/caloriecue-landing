import { getLatestSnapshot, getPreviousSnapshot, getSnapshotHistory } from '@/lib/dashboard-api';
import SecurityClient from './SecurityClient';

export default async function SecurityPage() {
  const [latest, previous, history] = await Promise.all([
    getLatestSnapshot(),
    getPreviousSnapshot(),
    getSnapshotHistory(30),
  ]);

  return <SecurityClient latest={latest} previous={previous} history={history} />;
}
