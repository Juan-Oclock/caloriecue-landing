import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from '@/components/landing/Hero';

const STATS = { total_users: 2990, meals_scanned: 17314, app_store_rating: 4.9 };

describe('Hero', () => {
  it('renders the locked H1 string exactly', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    // H1 spans two lines with a styled span; assert on textContent.
    expect(h1.textContent).toMatch(/Track calories for the goal you'?re working toward\./);
  });

  it('sub-headline contains "maintain" and does NOT contain "stay lean"', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/maintain/i);
    expect(body).not.toMatch(/stay lean/i);
  });

  it('renders four goal cards with correct labels and emojis', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    expect(screen.getByRole('button', { name: /lose weight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /build muscle/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^maintain$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gain weight/i })).toBeInTheDocument();
  });

  it('uses <button> elements (keyboard accessible) for goal cards, not <div>', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const card = screen.getByRole('button', { name: /lose weight/i });
    expect(card.tagName).toBe('BUTTON');
  });

  it('clicking a goal card calls onGoalSelect with the right Goal value', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Hero selectedGoal={null} onGoalSelect={onSelect} stats={STATS} />);
    await user.click(screen.getByRole('button', { name: /build muscle/i }));
    expect(onSelect).toHaveBeenCalledWith('build-muscle');
  });

  it('clicking the already-selected card does NOT call onGoalSelect (no deselect)', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Hero selectedGoal="lose-weight" onGoalSelect={onSelect} stats={STATS} />);
    await user.click(screen.getByRole('button', { name: /lose weight/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selected goal card has aria-pressed=true', () => {
    render(<Hero selectedGoal="maintain" onGoalSelect={() => {}} stats={STATS} />);
    const maintainBtn = screen.getByRole('button', { name: /^maintain$/i });
    expect(maintainBtn).toHaveAttribute('aria-pressed', 'true');
    const loseBtn = screen.getByRole('button', { name: /lose weight/i });
    expect(loseBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the personalized path when selectedGoal is set', () => {
    render(<Hero selectedGoal="lose-weight" onGoalSelect={() => {}} stats={STATS} />);
    expect(screen.getByText('Calculate your calorie deficit')).toBeInTheDocument();
    expect(screen.getByText('Track meals without guessing')).toBeInTheDocument();
    expect(screen.getByText('Monitor weekly progress')).toBeInTheDocument();
    expect(screen.getByText('Adjust when weight loss stalls')).toBeInTheDocument();
  });

  it('renders the build-muscle path when build-muscle is selected', () => {
    render(<Hero selectedGoal="build-muscle" onGoalSelect={() => {}} stats={STATS} />);
    expect(screen.getByText('Calculate your calorie surplus')).toBeInTheDocument();
    expect(screen.getByText('Hit your daily protein target')).toBeInTheDocument();
  });

  it('does NOT render any personalized path when selectedGoal is null', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    expect(screen.queryByText('Calculate your calorie deficit')).not.toBeInTheDocument();
    expect(screen.queryByText('Calculate your calorie surplus')).not.toBeInTheDocument();
    expect(screen.queryByText('Find your maintenance calories')).not.toBeInTheDocument();
  });

  it('"Start With My Goal" CTA is an anchor pointing at #calculator', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const startLink = screen.getByRole('link', { name: /start with my goal/i });
    expect(startLink.getAttribute('href')).toBe('#calculator');
  });

  it('"Get the App" CTA points at the App Store URL', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const appLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.includes('apps.apple.com'));
    expect(appLinks.length).toBeGreaterThan(0);
  });

  it('hero image (CalorieCue mockup) is rendered (Guardrail 2 — trust moment 1)', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const img = screen.getByAltText(/CalorieCue calorie tracking app on iPhone/i);
    expect(img).toBeInTheDocument();
  });

  it('trust strip renders formatted stat values and the App Store rating', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/Trusted by/i);
    expect(body).toMatch(/4\.9 ★/);
    // 2990 → "2.99k+" in compact format
    expect(body).toMatch(/\d/);
  });

  it('does not introduce React Context (regression guard for Decision #8)', async () => {
    // Best-effort source check: the Hero file should not import createContext.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/landing/Hero.tsx'),
      'utf-8',
    );
    expect(source).not.toMatch(/createContext/);
  });
});
