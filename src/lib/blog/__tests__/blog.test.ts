import { describe, it, expect } from 'vitest';
import {
  getPostsByTag,
  getGoalPathway,
  GOAL_TAGS,
  getAllPosts,
  getPostBySlug,
} from '@/lib/blog';

describe('getPostsByTag', () => {
  it('returns posts that include the requested tag', () => {
    const posts = getPostsByTag('lose-weight');
    expect(posts.length).toBeGreaterThanOrEqual(2);
    for (const post of posts) {
      expect(post.tags).toContain('lose-weight');
    }
  });

  it('returns an empty array for an unknown tag', () => {
    expect(getPostsByTag('zzz-does-not-exist')).toEqual([]);
  });

  it('honours the optional limit', () => {
    const all = getPostsByTag('lose-weight');
    expect(all.length).toBeGreaterThanOrEqual(3);
    expect(getPostsByTag('lose-weight', 2)).toHaveLength(2);
    expect(getPostsByTag('lose-weight', 0)).toHaveLength(0);
  });

  it('returns posts sorted by date descending (inherited from getAllPosts)', () => {
    const posts = getPostsByTag('lose-weight');
    for (let i = 1; i < posts.length; i++) {
      expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i].date).getTime(),
      );
    }
  });
});

describe('getGoalPathway', () => {
  it('returns at most `limit` posts', () => {
    expect(getGoalPathway('lose-weight', 3).length).toBeLessThanOrEqual(3);
    expect(getGoalPathway('build-muscle', 3).length).toBeLessThanOrEqual(3);
    expect(getGoalPathway('maintain', 3).length).toBeLessThanOrEqual(3);
    expect(getGoalPathway('gain-weight', 3).length).toBeLessThanOrEqual(3);
  });

  it('defaults to limit=3 when no limit is provided', () => {
    expect(getGoalPathway('lose-weight').length).toBeLessThanOrEqual(3);
  });

  it('every returned post carries the requested goal tag', () => {
    for (const goal of GOAL_TAGS) {
      for (const post of getGoalPathway(goal)) {
        expect(post.tags).toContain(goal);
      }
    }
  });
});

describe('goal tag coverage (post-tagging state)', () => {
  it('each of the four goal tags has at least one post', () => {
    for (const goal of GOAL_TAGS) {
      expect(getPostsByTag(goal).length).toBeGreaterThan(0);
    }
  });

  it('posts tagged with multiple goals appear in all relevant pathways', () => {
    // calories-in-food-list is tagged with all four goals
    const slug = 'calories-in-food-list';
    const post = getAllPosts().find((p) => p.slug === slug);
    expect(post).toBeDefined();
    if (!post) return;
    for (const goal of GOAL_TAGS) {
      expect(post.tags).toContain(goal);
      expect(getPostsByTag(goal).map((p) => p.slug)).toContain(slug);
    }
  });
});

describe('high-protein low-calorie foods SEO refresh', () => {
  it('targets the exact high-protein low-calorie foods search intent', () => {
    const post = getPostBySlug('high-protein-low-calorie-foods');

    expect(post).toBeDefined();
    expect(post?.title).toBe(
      'Foods High in Protein and Low in Calories: 40 Best Options Ranked',
    );
    expect(post?.description).toContain('foods high in protein and low in calories');
    expect(post?.content).toContain('Best foods high in protein and low in calories');
    expect(post?.content).toContain('/blog/protein-per-calorie');
    expect(post?.content).toContain('/blog/high-protein-low-calorie-grocery-list');
    expect(post?.content).toContain('/blog/high-protein-meals-under-500-calories');
  });
});

describe('GSC-backed SEO refreshes', () => {
  it('targets calorie counting grocery list intent without changing the slug', () => {
    const post = getPostBySlug('calorie-counting-grocery-list');

    expect(post).toBeDefined();
    expect(post?.slug).toBe('calorie-counting-grocery-list');
    expect(post?.title).toBe('Calorie Counting Grocery List: 75+ Foods to Buy by Aisle');
    expect(post?.description).toContain('calorie counting grocery list');
    expect(post?.dateModified).toBe('2026-07-02');
    expect(post?.content).toContain('What should be on a calorie counting grocery list?');
    expect(post?.content).toContain('/blog/how-to-count-calories');
    expect(post?.content).toContain('/blog/calorie-counting-diet-plan');
  });

  it('targets best AI calorie tracker intent on the existing app comparison slug', () => {
    const post = getPostBySlug('best-calorie-tracker-app');

    expect(post).toBeDefined();
    expect(post?.slug).toBe('best-calorie-tracker-app');
    expect(post?.title).toBe('Best AI Calorie Tracker Apps in 2026: Tested Comparison');
    expect(post?.dateModified).toBe('2026-07-02');
    expect(post?.content).toContain('What is the best AI calorie tracker app?');
    expect(post?.content).toContain('AI/photo logging');
    expect(post?.content).toContain('Photo estimate with editable calories and macros');
  });

  it('targets weight-loss drinks intent while keeping the broad drinks URL', () => {
    const post = getPostBySlug('what-to-drink-to-lose-weight');

    expect(post).toBeDefined();
    expect(post?.slug).toBe('what-to-drink-to-lose-weight');
    expect(post?.title).toBe(
      'What to Drink to Lose Weight: Best Drinks, Worst Drinks, and Simple Swaps',
    );
    expect(post?.description).toContain('zero-calorie drinks');
    expect(post?.dateModified).toBe('2026-07-02');
    expect(post?.content).toContain('Diet soda and zero-calorie drinks');
    expect(post?.content).toContain('Electrolyte drinks and sports drinks');
    expect(post?.content).toContain('/blog/why-am-i-always-hungry');
  });

  it('repairs the thin AI calorie tracking guide with stronger indexing signals', () => {
    const post = getPostBySlug('ai-calorie-tracking-guide');

    expect(post).toBeDefined();
    expect(post?.slug).toBe('ai-calorie-tracking-guide');
    expect(post?.title).toBe(
      'AI Calorie Tracking Guide: How Photo Food Logging Works, Accuracy, and When to Trust It',
    );
    expect(post?.description).toContain('AI calorie tracking');
    expect(post?.dateModified).toBe('2026-07-06');
    expect(post?.tldr).toContain('AI calorie tracking is best used as a fast first draft');
    expect(post?.faq?.length).toBeGreaterThanOrEqual(5);
    expect(post?.content.trim().split(/\s+/).length).toBeGreaterThan(1800);
    expect(post?.content).toContain('/blog/best-calorie-tracker-app');
    expect(post?.content).toContain('/blog/how-to-count-calories-without-a-food-scale');
    expect(post?.content).toContain('/blog/what-to-do-after-downloading-calorie-tracker');
    expect(post?.content).toContain('/blog/calorie-counting-grocery-list');
  });

  it('refreshes high-priority crawled-not-indexed posts with updated metadata', () => {
    const slugs = [
      'why-am-i-always-hungry',
      'how-many-calories-should-i-eat',
      'does-calorie-counting-work',
      'volume-eating',
      'how-to-track-calories-eating-out',
      'healthy-snacks-for-weight-loss',
    ];

    for (const slug of slugs) {
      const post = getPostBySlug(slug);
      expect(post, slug).toBeDefined();
      expect(post?.dateModified, slug).toBe('2026-07-06');
      expect(post?.tldr, slug).toBeTruthy();
      expect(post?.tldr?.length, slug).toBeGreaterThan(120);
    }
  });

  it('adds FAQ schema and stronger internal linking to the calorie-counting evidence page', () => {
    const post = getPostBySlug('does-calorie-counting-work');

    expect(post).toBeDefined();
    expect(post?.faq?.length).toBeGreaterThanOrEqual(5);
    expect(post?.content).toContain('/blog/how-to-start-counting-calories');
    expect(post?.content).toContain('/blog/how-to-count-calories');
    expect(post?.content).toContain('/blog/how-to-calculate-calorie-deficit');
    expect(post?.content).toContain('/blog/track-calories-without-obsessing');
    expect(post?.content).toContain('/blog/best-calorie-tracker-app');
  });
});

describe("macro tracking cheat sheet", () => {
  it("owns printable macro-food-list intent without duplicating the tutorial", () => {
    const post = getPostBySlug("macro-tracking-cheat-sheet");
    expect(post).toBeDefined();
    expect(post?.title).toBe(
      "Macro Tracking Cheat Sheet: Protein, Carb and Fat Foods (Free PDF)",
    );
    expect(post?.metaTitle).toBe(
      "Macro Tracking Cheat Sheet: Free PDF | CalorieCue",
    );
    expect(post?.description.length).toBeLessThanOrEqual(160);
    expect(post?.tags).toContain("macro-tracking");
    expect(post?.faq).toHaveLength(6);
    expect(post?.content).toContain("<MacroCheatSheetForm />");
    expect(post?.content).toContain("<AppStoreLink />");
    expect(post?.content).toContain("/blog/how-to-count-macros");
    expect(post?.content).toContain("/blog/calories-per-gram");
    expect(post?.content).toContain("/blog/protein-per-calorie");
    expect(post?.content).toContain("/tdee-calculator");
    expect(post?.content.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2_000);
  });

  it("links adjacent guides to the distinct printable intent", () => {
    expect(getPostBySlug("how-to-count-macros")?.content).toContain(
      "/blog/macro-tracking-cheat-sheet",
    );
    expect(getPostBySlug("calorie-counting-cheat-sheet")?.content).toContain(
      "/blog/macro-tracking-cheat-sheet",
    );
  });
});
