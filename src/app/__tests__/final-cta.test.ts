import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Source-text assertions on the homepage Final CTA + JSON-LD wiring.
 *
 * Same rationale as page-order.test.ts / page-copy.test.ts: page.tsx is an
 * async Server Component that fetches Supabase on render, so we assert on
 * the source string rather than rendering it.
 */

const PAGE_PATH = path.join(process.cwd(), 'src/app/page.tsx');
const source = fs.readFileSync(PAGE_PATH, 'utf-8').replace(/&apos;/g, "'");

// Narrow to the Final CTA section so guards don't trip on unrelated copy.
function ctaSection(): string {
  const start = source.indexOf('{/* CTA Section */}');
  if (start === -1) throw new Error('CTA Section marker not found in page.tsx');
  // The CTA section is the last section before <Footer />.
  const end = source.indexOf('<Footer', start);
  if (end === -1) throw new Error('<Footer /> not found after CTA section');
  return source.slice(start, end);
}

describe('Final CTA (Feature 6 — two paths)', () => {
  it('offers the App Store download path', () => {
    expect(ctaSection()).toContain('AppStoreButton');
  });

  it('offers a "Browse the guides" path to /blog', () => {
    const cta = ctaSection();
    expect(cta).toContain('Browse the guides');
    expect(cta).toMatch(/href=["']\/blog["']/);
  });

  it('does NOT reintroduce v1.1 email capture (regression guard)', () => {
    const cta = ctaSection().toLowerCase();
    expect(cta).not.toContain('email');
    expect(cta).not.toContain('send my plan');
    expect(cta).not.toContain('waitlist');
  });
});

describe('FAQ JSON-LD (Feature 6 — derived from shared data)', () => {
  it('derives the FAQ JSON-LD from the shared faq-data builder, not an inline array', () => {
    expect(source).toContain('buildFaqPageJsonLd');
    // The old hand-maintained inline FAQ array must be gone.
    expect(source).not.toContain('const faqJsonLd = {');
  });
});
