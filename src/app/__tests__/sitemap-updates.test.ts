import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import * as blog from '@/lib/blog';

afterEach(() => vi.restoreAllMocks());

describe('blog sitemap modification dates', () => {
  it('reflects an older article update even when a newer publication is first', () => {
    const posts = blog.getAllPosts();
    vi.spyOn(blog, 'getAllPosts').mockReturnValue([
      { ...posts[0], slug: 'new-post', date: '2026-08-01', dateModified: undefined },
      { ...posts[0], slug: 'updated-post', date: '2026-02-01', dateModified: '2026-09-07' },
    ]);

    const entries = sitemap();
    expect(entries.find(entry => entry.url === 'https://caloriecue.app/blog')?.lastModified)
      .toEqual(new Date('2026-09-07'));
    expect(entries.find(entry => entry.url.endsWith('/updated-post'))?.lastModified)
      .toEqual(new Date('2026-09-07'));
  });

  it('keeps a stable fallback when there are no published articles', () => {
    vi.spyOn(blog, 'getAllPosts').mockReturnValue([]);
    expect(sitemap().find(entry => entry.url === 'https://caloriecue.app/blog')?.lastModified)
      .toEqual(new Date('2026-07-06'));
  });
});
