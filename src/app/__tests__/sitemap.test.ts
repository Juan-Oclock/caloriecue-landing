import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { generateMetadata as generateTagMetadata } from '@/app/blog/tag/[tag]/page';
import { GOAL_TAGS } from '@/lib/blog';

describe('sitemap SEO hygiene', () => {
  it('does not submit thin goal tag listing pages to Google', () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const tag of GOAL_TAGS) {
      expect(urls).not.toContain(`https://caloriecue.app/blog/tag/${tag}`);
    }
  });

  it('uses stable lastModified dates for static pages', () => {
    const entries = new Map(sitemap().map((entry) => [entry.url, entry]));

    expect(entries.get('https://caloriecue.app')?.lastModified?.toISOString()).toBe(
      '2026-07-06T00:00:00.000Z',
    );
    expect(entries.get('https://caloriecue.app/tdee-calculator')?.lastModified?.toISOString()).toBe(
      '2026-07-02T00:00:00.000Z',
    );
    expect(entries.get('https://caloriecue.app/support')?.lastModified?.toISOString()).toBe(
      '2026-06-01T00:00:00.000Z',
    );
    expect(entries.get('https://caloriecue.app/privacy')?.lastModified?.toISOString()).toBe(
      '2026-06-01T00:00:00.000Z',
    );
    expect(entries.get('https://caloriecue.app/terms')?.lastModified?.toISOString()).toBe(
      '2026-06-01T00:00:00.000Z',
    );
  });

  it('marks goal tag listing pages as noindex while preserving followed links', async () => {
    const metadata = await generateTagMetadata({
      params: Promise.resolve({ tag: 'lose-weight' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
