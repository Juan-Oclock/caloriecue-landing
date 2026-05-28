import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroAndCalculatorFlow } from '@/components/landing/HeroAndCalculatorFlow';

const STATS = { total_users: 2990, meals_scanned: 17314, app_store_rating: 4.9 };

describe('HeroAndCalculatorFlow', () => {
  it('renders both Hero (H1) and InlineCalculator (#calculator section)', () => {
    const { container } = render(<HeroAndCalculatorFlow stats={STATS} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(container.querySelector('#calculator')).not.toBeNull();
  });

  it("InlineCalculator's selectedGoal prop starts as null", () => {
    render(<HeroAndCalculatorFlow stats={STATS} />);
    expect(screen.getByTestId('calculator-selected-goal').textContent).toBe('none');
  });

  it("selecting a goal in Hero flows to InlineCalculator's selectedGoal prop", async () => {
    const user = userEvent.setup();
    render(<HeroAndCalculatorFlow stats={STATS} />);
    await user.click(screen.getByRole('button', { name: /build muscle/i }));
    expect(screen.getByTestId('calculator-selected-goal').textContent).toBe('build-muscle');
  });

  it('switching between goals updates the calculator prop', async () => {
    const user = userEvent.setup();
    render(<HeroAndCalculatorFlow stats={STATS} />);
    await user.click(screen.getByRole('button', { name: /lose weight/i }));
    expect(screen.getByTestId('calculator-selected-goal').textContent).toBe('lose-weight');
    await user.click(screen.getByRole('button', { name: /gain weight/i }));
    expect(screen.getByTestId('calculator-selected-goal').textContent).toBe('gain-weight');
  });

  it('does not introduce React Context (regression guard for Decision #8)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    for (const f of [
      'src/components/landing/HeroAndCalculatorFlow.tsx',
      'src/components/landing/Hero.tsx',
      'src/components/landing/InlineCalculator.tsx',
    ]) {
      const source = fs.readFileSync(path.join(process.cwd(), f), 'utf-8');
      expect(source, `${f} must not use createContext`).not.toMatch(/createContext/);
    }
  });
});
