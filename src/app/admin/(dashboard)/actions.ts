'use server';

import { createClient } from '@/lib/supabase/server';

export async function triggerManualSnapshot(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, error: 'Not authenticated' };
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/compute-metrics`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ manual: true }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: body };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
