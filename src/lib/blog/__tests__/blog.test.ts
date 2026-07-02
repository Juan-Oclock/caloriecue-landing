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
