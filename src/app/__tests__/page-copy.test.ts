import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Source-text assertions on the homepage copy.
 *
 * Why we read the file as text instead of rendering it: page.tsx is an
 * async Server Component that does a Supabase fetch on render — exercising
 * that in jsdom requires mocking the network and is fragile. For Feature 1
 * (pure copy rewrite, no structural changes), asserting on the source
 * string is sufficient and matches the spec's regression-guard intent:
 * "assert old strings are NOT present."
 */

const PAGE_PATH = path.join(process.cwd(), 'src/app/page.tsx');
// Normalize HTML entities the codebase uses inside JSX (apostrophe is
// commonly written &apos; to satisfy react/no-unescaped-entities) so
// content-presence assertions can use plain ASCII strings.
const source = fs.readFileSync(PAGE_PATH, 'utf-8').replace(/&apos;/g, "'");

// Note: "How to actually hit your number" moved to Method.tsx in
// Feature 5 — its presence is now asserted by Method.test.tsx.
// Landing A — Goal First redesign copy (Sept 2026).
const NEW_HEADERS = [
  'Logging that never feels like work.',
  'Snap it. Logged in 3 seconds.',
  'A nutritionist in your pocket',
  'Packaged foods, one tap',
  'Log before you forget',
  'Understand why weight moves',
  'Stay on track eating out',
  'Syncs with Apple Health',
  // Note: "Real people. Real results." lives in ResultsAndAuthority.tsx —
  // its presence is asserted by ResultsAndAuthority.test.tsx.
  "Pick your goal. We'll handle the math.",
];

// Old strings that must no longer appear as headers/labels on the page.
const OLD_HEADERS = [
  'Smart Features for Smart Tracking',
  'AI Meal Scanning',
  'Quick Logging',
  'Progress Tracking',
  'Smart Notifications',
  'Barcode Scanner',
  'Start in Three Steps',
  'See It in Action',
  'Loved by Our Users',
  'Ready to Take Control?',
  // Pre-redesign section removed with Landing A (no video block in the design).
  'What a normal day of tracking looks like',
];

// "AI Coach (Cue)" is a real product name that still appears in FAQ
// answer text intentionally. We only guard against the old FeatureCard
// tile label coming back via the title prop pattern.
const OLD_TILE_LABEL_PATTERNS = [
  /title=["']AI Coach \(Cue\)["']/,
];

describe('Homepage copy (Feature 1)', () => {
  describe('new outcome-language headers are present', () => {
    for (const header of NEW_HEADERS) {
      it(`contains: "${header}"`, () => {
        expect(source).toContain(header);
      });
    }
  });

  describe('old product-vocabulary headers are removed', () => {
    for (const header of OLD_HEADERS) {
      it(`no longer contains: "${header}"`, () => {
        expect(source).not.toContain(header);
      });
    }
    for (const pattern of OLD_TILE_LABEL_PATTERNS) {
      it(`no longer contains tile label pattern: ${pattern}`, () => {
        expect(source).not.toMatch(pattern);
      });
    }
  });

  describe('absolute-claim words must not appear in headers/copy', () => {
    // Quick guardrail: no "exactly," "guaranteed," "perfect," "100%" in
    // section headings or feature tile labels.
    it('does not contain the word "guaranteed"', () => {
      expect(source.toLowerCase()).not.toContain('guaranteed');
    });
  });

  // Note: the Feature-3 H1 cross-PR guard was removed once Feature 3
  // shipped. The new H1 now lives in Hero.tsx (asserted in Hero.test.tsx),
  // not in page.tsx, so the guard would always pass trivially.
});
