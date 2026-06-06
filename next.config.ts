import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Normalize trailing slashes - prevents duplicate URL issues for SEO
  trailingSlash: false,

  // @react-pdf/renderer relies on native-ish deps (yoga-layout, fontkit) that
  // must not be bundled by Webpack/Turbopack. It is only ever imported in
  // server-side API routes (the cheat-sheet PDF generator).
  serverExternalPackages: ['@react-pdf/renderer'],

  // The cheat-sheet PDF routes read fonts + images from /public by absolute
  // path at runtime; bundle those files into the serverless functions so they
  // exist in production.
  outputFileTracingIncludes: {
    '/api/cheat-sheet/pdf': [
      './public/fonts/**',
      './public/cheat-sheet/**',
      './public/caloriecue_logo.png',
      './public/app-icons/1024.png',
      './public/mockup-caloriecue.png',
    ],
    '/api/cheat-sheet-download': [
      './public/fonts/**',
      './public/cheat-sheet/**',
      './public/caloriecue_logo.png',
      './public/app-icons/1024.png',
      './public/mockup-caloriecue.png',
    ],
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
