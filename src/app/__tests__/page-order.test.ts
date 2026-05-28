import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Source-text assertions on the homepage section order.
 *
 * Same rationale as page-copy.test.ts: page.tsx is an async Server
 * Component that fetches Supabase on render, which is fragile to
 * test via Testing Library. For section ordering this is sufficient —
 * we assert that the JSX markers for each section appear in the
 * expected order in the source file.
 */

const PAGE_PATH = path.join(process.cwd(), 'src/app/page.tsx');
const source = fs.readFileSync(PAGE_PATH, 'utf-8');

function indexOf(marker: string): number {
  const idx = source.indexOf(marker);
  if (idx === -1) throw new Error(`Marker not found in page.tsx: ${marker}`);
  return idx;
}

describe('Homepage section order (Feature 5 — guided flow)', () => {
  it('Hero+Calculator comes first, before everything else', () => {
    const hero = indexOf('<HeroAndCalculatorFlow');
    const method = indexOf('<Method');
    const pathways = indexOf('<GoalPathways');
    expect(hero).toBeLessThan(method);
    expect(hero).toBeLessThan(pathways);
  });

  it('Method section comes immediately after Hero+Calculator and before Goal Pathways', () => {
    const hero = indexOf('<HeroAndCalculatorFlow');
    const method = indexOf('<Method');
    const pathways = indexOf('<GoalPathways');
    expect(method).toBeGreaterThan(hero);
    expect(method).toBeLessThan(pathways);
  });

  it('Goal Pathways comes before Pricing and FAQ (it was moved up from the bottom)', () => {
    const pathways = indexOf('<GoalPathways');
    const pricing = indexOf('<PricingSection');
    const faq = indexOf('<FAQSection');
    expect(pathways).toBeLessThan(pricing);
    expect(pathways).toBeLessThan(faq);
  });

  it('Pricing comes before FAQ', () => {
    const pricing = indexOf('<PricingSection');
    const faq = indexOf('<FAQSection');
    expect(pricing).toBeLessThan(faq);
  });

  it('the old "How It Works" 3-step section is removed (replaced by Method)', () => {
    // The replaced 3-step section used "Download & Open" as its first step.
    expect(source).not.toContain('Download & Open');
    expect(source).not.toContain('Scan Your Meal');
    expect(source).not.toContain('Get Smart Insights');
  });

  it('Method is the only section using the "How to actually hit your number" heading', () => {
    // Substring count — should appear exactly once (inside the Method
    // import or inside the page.tsx comment for the section, but NOT
    // duplicated in page source). page.tsx itself should not contain the
    // heading string at all now that Method.tsx owns it.
    const matches = source.match(/How to actually hit your number/g) ?? [];
    expect(matches.length).toBe(0);
  });
});
