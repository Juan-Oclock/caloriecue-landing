'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/audit-log';

export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Email and password are required.' };
    }

    // Rate limit by email
    const { allowed, retryAfterMs } = checkRateLimit('login', email);
    if (!allowed) {
      const minutes = Math.ceil((retryAfterMs || 0) / 60000);
      return { error: `Too many login attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` };
    }

    const headerStore = await headers();
    const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = headerStore.get('user-agent') || 'unknown';

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await logAdminAction({
        action: 'login_failed',
        ip_address: ip,
        user_agent: userAgent,
        metadata: { email, reason: 'invalid_credentials' },
      });
      return { error: 'Invalid email or password.' };
    }

    // Check if the user is in the admin whitelist
    const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!adminUserIds.includes(data.user.id)) {
      await logAdminAction({
        user_id: data.user.id,
        action: 'login_unauthorized',
        ip_address: ip,
        user_agent: userAgent,
        metadata: { email },
      });
      await supabase.auth.signOut();
      return { error: 'You do not have admin access.' };
    }

    await logAdminAction({
      user_id: data.user.id,
      action: 'login_success',
      ip_address: ip,
      user_agent: userAgent,
      metadata: { email },
    });

    redirect('/admin');
  } catch (err) {
    // Re-throw Next.js redirect/notFound errors (they use a special digest property)
    if (typeof err === 'object' && err !== null && 'digest' in err) throw err;
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return { error: 'Email is required.' };
    }

    const { allowed, retryAfterMs } = checkRateLimit('login', email);
    if (!allowed) {
      const minutes = Math.ceil((retryAfterMs || 0) / 60000);
      return { error: `Too many attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` };
    }

    const supabase = await createClient();

    const headerStore = await headers();
    const host = headerStore.get('host') || 'localhost:3001';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/admin/reset-password`,
    });

    if (error) {
      return { error: 'Failed to send reset email. Please try again.' };
    }

    return { success: true };
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await logAdminAction({
        user_id: user.id,
        action: 'logout',
      });
    }

    await supabase.auth.signOut();
    redirect('/admin/login');
  } catch (err) {
    // Re-throw Next.js redirect/notFound errors
    if (typeof err === 'object' && err !== null && 'digest' in err) throw err;
    // Fallback: redirect to login page
    redirect('/admin/login');
  }
}
