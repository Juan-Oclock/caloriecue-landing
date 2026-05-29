import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthorityPanel } from '@/components/landing/AuthorityPanel';

describe('AuthorityPanel', () => {
  it('renders the "Built on validated science" heading', () => {
    render(<AuthorityPanel />);
    expect(
      screen.getByRole('heading', { name: /built on validated science/i }),
    ).toBeInTheDocument();
  });

  it('states the Mifflin-St Jeor basis and the honest 10–15% caveat', () => {
    render(<AuthorityPanel />);
    expect(screen.getByText(/mifflin-st jeor/i)).toBeInTheDocument();
    expect(screen.getByText(/10–15%/)).toBeInTheDocument();
  });

  it('links to the methodology anchor', () => {
    render(<AuthorityPanel />);
    const link = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/tdee-calculator#methodology');
    expect(link).toBeDefined();
    expect(link!.textContent?.toLowerCase()).toContain('methodology');
  });

  it('does NOT contain fake RD credentials (guardrail)', () => {
    const { container } = render(<AuthorityPanel />);
    const text = container.textContent?.toLowerCase() ?? '';
    expect(text).not.toContain('reviewed by');
    expect(text).not.toContain('registered dietitian');
    expect(text).not.toMatch(/\brd\b/);
  });
});
