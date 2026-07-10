import { updateSession } from '@/lib/supabase/middleware';
import { buildAdminCsp, buildPublicCsp } from '@/lib/csp';
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

  // Public routes use a stable CSP so their rendered output can be cached.
  if (!pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', buildPublicCsp());
    return response;
  }

  // Admin routes remain dynamic and keep the stricter per-request nonce CSP.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildAdminCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const { user, supabaseResponse } = await updateSession(request, requestHeaders);

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

  supabaseResponse.headers.set('Content-Security-Policy', csp);
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:html|png|jpg|jpeg|gif|svg|webp|ico|xml|txt|json|webmanifest)).*)',
  ],
};
