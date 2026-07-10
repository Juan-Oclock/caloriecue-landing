const sharedDirectives = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com https://*.supabase.co",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "trusted-types default nextjs#bundler",
  "require-trusted-types-for 'script'",
];

export function buildPublicCsp(
  isDev = process.env.NODE_ENV === "development"
): string {
  return [
    `script-src 'self' 'unsafe-inline'${
      isDev ? " 'unsafe-eval'" : ""
    } https://www.googletagmanager.com`,
    ...sharedDirectives,
  ].join("; ");
}

export function buildAdminCsp(
  nonce: string,
  isDev = process.env.NODE_ENV === "development"
): string {
  return [
    `script-src 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    ...sharedDirectives,
  ].join("; ");
}
