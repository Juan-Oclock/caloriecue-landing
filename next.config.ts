import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Normalize trailing slashes - prevents duplicate URL issues for SEO
  trailingSlash: false,

  // Email functions read the same PDFs produced once before next build.
  outputFileTracingIncludes: {
    '/api/cheat-sheet-download': ['./public/downloads/caloriecue-cheat-sheet.pdf'],
    '/api/macro-cheat-sheet-download': ['./public/downloads/caloriecue-macro-tracking-cheat-sheet.pdf'],
  },

  // Serve optimized image formats
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      {
        source: '/blog/why-am-i-not-losing-weight',
        destination: '/blog/why-calorie-deficit-isnt-working',
        statusCode: 301,
      },
    ];
  },

  async headers() {
    // CSP is set dynamically in middleware.ts (nonce-based).
    // Only static security headers go here.
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
