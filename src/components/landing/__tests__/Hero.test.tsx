import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hero } from '@/components/landing/Hero';

const STATS = { total_users: 2990, meals_scanned: 17314, app_store_rating: 4.9 };

describe('Hero', () => {
  it('renders the Goal-First H1 (single H1, two lines + coral accent)', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    // H1 spans two lines with a styled span; assert on textContent.
    expect(h1s[0].textContent?.replace(/\s+/g, ' ')).toMatch(/Pick your goal\.\s*We'll do the math\./);
  });

  it('sub-headline names the calorie target and photo logging (SEO copy)', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/daily calorie target/i);
    expect(body).toMatch(/single photo/i);
  });

  it('sub-headline contains "maintain" and does NOT contain "stay lean"', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/maintain/i);
    expect(body).not.toMatch(/stay lean/i);
  });

  it('renders four goal cards with labels and a one-line hint each', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    expect(screen.getByRole('button', { name: /^lose weight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^build muscle/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^maintain/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^gain weight/i })).toBeInTheDocument();
    expect(screen.getByText('Deficit, high protein')).toBeInTheDocument();
    expect(screen.getByText('Hold steady')).toBeInTheDocument();
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
    const maintainBtn = screen.getByRole('button', { name: /^maintain/i });
    expect(maintainBtn).toHaveAttribute('aria-pressed', 'true');
    const loseBtn = screen.getByRole('button', { name: /lose weight/i });
    expect(loseBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('selecting a goal highlights it without rendering a separate path panel (Landing A design)', () => {
    render(<Hero selectedGoal="lose-weight" onGoalSelect={() => {}} stats={STATS} />);
    expect(screen.getByRole('button', { name: /^lose weight/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Calculate your calorie deficit')).not.toBeInTheDocument();
  });

  it('"Find my calorie target" CTA is an anchor pointing at #calculator', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const startLink = screen.getByRole('link', { name: /find my calorie target/i });
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

  it('trust badge renders the App Store rating and a rounded people count', () => {
    render(<Hero selectedGoal={null} onGoalSelect={() => {}} stats={STATS} />);
    const body = document.body.textContent ?? '';
    expect(body).toMatch(/4\.9 on the App Store/);
    // 2990 → "2,900+" (rounded down to a friendly figure)
    expect(body).toMatch(/2,900\+ people tracking/);
  });

  it('formatPeopleCount rounds down to friendly figures', async () => {
    const { formatPeopleCount } = await import('@/components/landing/Hero');
    expect(formatPeopleCount(650)).toBe('650+');
    expect(formatPeopleCount(2990)).toBe('2,900+');
    expect(formatPeopleCount(12_480)).toBe('12,000+');
    expect(formatPeopleCount(1_250_000)).toBe('1.2M+');
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
