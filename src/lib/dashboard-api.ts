import { createClient } from '@/lib/supabase/server';
import type { DashboardSnapshot } from './dashboard-types';

export async function getLatestSnapshot(): Promise<DashboardSnapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dashboard_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch latest snapshot:', error.message);
    return null;
  }

  return data as DashboardSnapshot;
}

export async function getPreviousSnapshot(): Promise<DashboardSnapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dashboard_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .range(1, 1);

  if (error || !data?.length) {
    return null;
  }

  return data[0] as DashboardSnapshot;
}

export async function getSnapshotHistory(days: number = 30): Promise<DashboardSnapshot[]> {
  const supabase = await createClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data, error } = await supabase
    .from('dashboard_snapshots')
    .select('*')
    .gte('snapshot_date', cutoff.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true });

  if (error) {
    console.error('Failed to fetch snapshot history:', error.message);
    return [];
  }

  return (data || []) as DashboardSnapshot[];
}
