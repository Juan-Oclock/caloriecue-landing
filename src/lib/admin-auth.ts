import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function verifyAdmin(): Promise<{
  user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']>;
  isAdmin: true;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/admin/login');
    }

    const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!adminUserIds.includes(user.id)) {
      redirect('/admin/unauthorized');
    }

    return { user, isAdmin: true };
  } catch (err) {
    // Re-throw Next.js redirect errors
    if (err instanceof Error && 'digest' in err) throw err;
    // Any other error (e.g. Supabase client failure) — redirect to login
    redirect('/admin/login');
  }
}
