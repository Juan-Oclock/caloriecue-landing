import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const CANONICAL_HOST = 'caloriecue.app';

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com https://*.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "trusted-types default",
    "require-trusted-types-for 'script'",
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Redirect www → non-www (permanent 301)
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  // Forward nonce + CSP to Next.js via request headers so layout can read them
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const { pathname } = request.nextUrl;

  // Only refresh Supabase session for admin routes
  if (!pathname.startsWith('/admin')) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

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
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|xml|txt|json|webmanifest)).*)',
  ],
};
