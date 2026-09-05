import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Method } from '@/components/landing/Method';

describe('Method', () => {
  it('renders the section title "Four habits. That\'s the whole system."', () => {
    render(<Method />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent?.replace(/\s+/g, ' ')).toMatch(/Four habits\.\s*That's the whole system\./);
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
    const items = container.querySelectorAll('ol > li');
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
      name: /track without burning out/i,
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

  it('every step offers a next action: step 1 → #calculator, step 2 → #features, steps 3–4 → guides', () => {
    render(<Method />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('#calculator');
    expect(hrefs).toContain('#features');
    expect(hrefs.filter((h) => h?.startsWith('/blog/')).length).toBeGreaterThanOrEqual(2);
  });
});
