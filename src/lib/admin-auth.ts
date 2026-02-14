import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function verifyAdmin(): Promise<{
  user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']>;
  isAdmin: true;
}> {
  let redirectTo: string | null = null;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirectTo = '/admin/login';
    } else {
      const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (!adminUserIds.includes(user.id)) {
        redirectTo = '/admin/unauthorized';
      } else {
        return { user, isAdmin: true };
      }
    }
  } catch {
    redirectTo = '/admin/login';
  }

  redirect(redirectTo!);
}
