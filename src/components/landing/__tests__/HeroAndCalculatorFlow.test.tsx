import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroAndCalculatorFlow } from '@/components/landing/HeroAndCalculatorFlow';

const STATS = { total_users: 2990, meals_scanned: 17314, app_store_rating: 4.9 };

/**
 * Both Hero and InlineCalculator now render goal buttons (Lose Weight,
 * Build Muscle, etc.). To verify state flow end-to-end we scope queries:
 * the Hero's goal group is labelled "Choose your goal", the calculator's
 * is labelled "Goal". The calculator pre-fill is observed via the
 * aria-pressed state on the matching goal button inside #calculator.
 */
function getHeroGoalButton(label: RegExp): HTMLElement {
  const heroGroup = screen.getByRole('group', { name: /choose your goal/i });
  return within(heroGroup).getByRole('button', { name: label });
}

function getCalculatorGoalButton(label: RegExp): HTMLElement {
  const calcSection = document.getElementById('calculator')!;
  const calcGroup = within(calcSection).getByRole('group', { name: /^Goal$/i });
  return within(calcGroup).getByRole('button', { name: label });
}

describe('HeroAndCalculatorFlow', () => {
  it('renders both Hero (H1) and InlineCalculator (#calculator section)', () => {
    const { container } = render(<HeroAndCalculatorFlow stats={STATS} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(container.querySelector('#calculator')).not.toBeNull();
  });

  it("InlineCalculator's goal pre-fill starts at the default (lose-weight, not user-selected)", () => {
    render(<HeroAndCalculatorFlow stats={STATS} />);
    // No goal selected in hero — calculator falls back to its own default
    // (lose-weight). Hero's lose-weight button should NOT be aria-pressed.
    expect(getHeroGoalButton(/lose weight/i)).toHaveAttribute('aria-pressed', 'false');
    expect(getCalculatorGoalButton(/lose weight/i)).toHaveAttribute('aria-pressed', 'true');
  });

  it("selecting a goal in Hero updates the calculator's pre-filled goal", async () => {
    const user = userEvent.setup();
    render(<HeroAndCalculatorFlow stats={STATS} />);
    await user.click(getHeroGoalButton(/build muscle/i));
    expect(getCalculatorGoalButton(/build muscle/i)).toHaveAttribute('aria-pressed', 'true');
    expect(getCalculatorGoalButton(/lose weight/i)).toHaveAttribute('aria-pressed', 'false');
  });

  it('switching between hero goals updates the calculator pre-fill', async () => {
    const user = userEvent.setup();
    render(<HeroAndCalculatorFlow stats={STATS} />);
    await user.click(getHeroGoalButton(/lose weight/i));
    expect(getCalculatorGoalButton(/lose weight/i)).toHaveAttribute('aria-pressed', 'true');
    await user.click(getHeroGoalButton(/gain weight/i));
    expect(getCalculatorGoalButton(/gain weight/i)).toHaveAttribute('aria-pressed', 'true');
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
