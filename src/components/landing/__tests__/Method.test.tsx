import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Method } from '@/components/landing/Method';

describe('Method', () => {
  it('renders the locked section title "How to actually hit your number"', () => {
    render(<Method />);
    expect(
      screen.getByRole('heading', { level: 2, name: /how to actually hit your number/i }),
    ).toBeInTheDocument();
  });

  it('renders an ordered list with exactly 4 steps', () => {
    const { container } = render(<Method />);
    const list = container.querySelector('ol');
    expect(list).not.toBeNull();
    const items = list!.querySelectorAll('li');
    expect(items.length).toBe(4);
  });

  it('every step has a non-empty title and body', () => {
    const { container } = render(<Method />);
    const items = container.querySelectorAll('ol > div > li');
    expect(items.length).toBe(4);
    for (const item of Array.from(items)) {
      const h3 = item.querySelector('h3');
      const p = item.querySelector('p');
      expect(h3?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
      expect(p?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('step 2 contains the bridge sentence introducing CalorieCue (Guardrail 3)', () => {
    render(<Method />);
    // Step 2 title:
    const step2Title = screen.getByRole('heading', {
      level: 3,
      name: /track what you eat/i,
    });
    expect(step2Title).toBeInTheDocument();
    // Body of step 2 must mention "photo" and "CalorieCue".
    const li = step2Title.closest('li');
    expect(li).not.toBeNull();
    const bodyText = li!.textContent ?? '';
    expect(bodyText.toLowerCase()).toContain('photo');
    expect(bodyText).toContain('CalorieCue');
  });

  it('renders a section landmark with id="method" so anchor links land', () => {
    const { container } = render(<Method />);
    const section = container.querySelector('section#method');
    expect(section).not.toBeNull();
  });

  it('ends with a transition link pointing to the guides section', () => {
    render(<Method />);
    const guidesLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '#guides');
    expect(guidesLinks.length).toBeGreaterThan(0);
  });
});
