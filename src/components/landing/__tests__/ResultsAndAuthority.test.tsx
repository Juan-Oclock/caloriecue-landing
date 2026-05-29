import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsAndAuthority } from '@/components/landing/ResultsAndAuthority';

const REVIEWS = [
  { author: 'BiggiAgile123', text: 'I like that it is connected with Apple Health.', source: 'App Store Review' },
  { author: 'D.mercer', text: 'works exactly how i expected and is good with weight loss goals', source: 'App Store Review' },
];

describe('ResultsAndAuthority', () => {
  it('renders the locked section heading "Real people, real results"', () => {
    render(<ResultsAndAuthority reviews={REVIEWS} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /real people, real results/i }),
    ).toBeInTheDocument();
  });

  it('renders every review passed in', () => {
    render(<ResultsAndAuthority reviews={REVIEWS} />);
    for (const review of REVIEWS) {
      expect(screen.getByText(review.text)).toBeInTheDocument();
      expect(screen.getByText(review.author)).toBeInTheDocument();
    }
  });

  it('no longer renders the authority block (moved beside the calculator)', () => {
    render(<ResultsAndAuthority reviews={REVIEWS} />);
    expect(
      screen.queryByRole('heading', { name: /built on validated science/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/mifflin-st jeor/i)).not.toBeInTheDocument();
  });

  it('does NOT contain fake RD credentials (guardrail)', () => {
    const { container } = render(<ResultsAndAuthority reviews={REVIEWS} />);
    const text = container.textContent?.toLowerCase() ?? '';
    expect(text).not.toContain('reviewed by');
    expect(text).not.toContain('registered dietitian');
    // guard the standalone credential abbreviation, not substrings like "card"
    expect(text).not.toMatch(/\brd\b/);
  });
});
