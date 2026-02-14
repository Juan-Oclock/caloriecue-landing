import { createClient } from '@/lib/supabase/server';

interface AuditLogEntry {
  user_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('admin_access_logs').insert({
      user_id: entry.user_id || null,
      action: entry.action,
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || null,
      metadata: entry.metadata || {},
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Failed to write audit log:', error);
  }
}
