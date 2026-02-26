import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const CANONICAL_HOST = 'caloriecue.app';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Redirect www → non-www (permanent 301)
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  // Only refresh Supabase session for admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);

  const isExcludedAdminRoute =
    pathname === '/admin/login' || pathname === '/admin/unauthorized' || pathname === '/admin/reset-password';

  if (!isExcludedAdminRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }

    const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (adminUserIds.length === 0) {
      console.warn('ADMIN_USER_IDS env var is empty or not set — all admin access will be denied');
    }

    if (!adminUserIds.includes(user.id)) {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = '/admin/unauthorized';
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|xml|txt|json|webmanifest)).*)',
  ],
};
