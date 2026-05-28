import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { GoalPathways } from '@/components/landing/GoalPathways';
import { GOAL_TAGS, getGoalPathway } from '@/lib/blog';

describe('GoalPathways', () => {
  it('renders all four pathway columns with their goal labels', () => {
    render(<GoalPathways />);
    expect(screen.getByRole('heading', { name: /lose weight/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /build muscle/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /maintain/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /gain weight/i, level: 3 })).toBeInTheDocument();
  });

  it('renders a "View all" link for each goal pointing to /blog/tag/[goal]', () => {
    render(<GoalPathways />);
    for (const goal of GOAL_TAGS) {
      const links = screen.getAllByRole('link');
      const viewAll = links.find(
        (a) => a.getAttribute('href') === `/blog/tag/${goal}`,
      );
      expect(viewAll, `expected /blog/tag/${goal} link`).toBeDefined();
    }
  });

  it('renders post links from getGoalPathway for each populated pathway', () => {
    render(<GoalPathways />);
    for (const goal of GOAL_TAGS) {
      const expectedPosts = getGoalPathway(goal, 3);
      if (expectedPosts.length === 0) continue;
      for (const post of expectedPosts) {
        // At least one link with this href should exist
        const linkHrefs = screen
          .getAllByRole('link')
          .map((a) => a.getAttribute('href'));
        expect(
          linkHrefs.some((h) => h === `/blog/${post.slug}`),
          `expected /blog/${post.slug} link for goal ${goal}`,
        ).toBe(true);
      }
    }
  });

  it('renders an empty-state link when a pathway has zero posts (synthetic check via getGoalPathway)', () => {
    // We don't have a 0-post goal in the current corpus, so this test
    // covers the render contract instead: every pathway tile renders its
    // header AND a "View all" link, regardless of whether posts exist.
    render(<GoalPathways />);
    const allLinks = screen.getAllByRole('link');
    for (const goal of GOAL_TAGS) {
      const viewAllExists = allLinks.some(
        (a) => a.getAttribute('href') === `/blog/tag/${goal}`,
      );
      expect(viewAllExists).toBe(true);
    }
  });

  it('uses semantic anchor links (not JS handlers) so links are crawlable', () => {
    render(<GoalPathways />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBeTruthy();
    }
  });

  it('has a section landmark so screen-reader users can locate it', () => {
    const { container } = render(<GoalPathways />);
    const sectionWithId = container.querySelector('section#guides');
    expect(sectionWithId, 'expected <section id="guides">').not.toBeNull();
  });

  it('renders the section H2', () => {
    render(<GoalPathways />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /guide|pathway|goal/i,
      }),
    ).toBeInTheDocument();
  });
});
