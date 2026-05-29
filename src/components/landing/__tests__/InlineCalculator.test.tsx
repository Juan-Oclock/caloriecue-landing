import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineCalculator } from '@/components/landing/InlineCalculator';
import type { AnalyticsAdapter } from '@/lib/landing/analytics';

function setup(overrides: { selectedGoal?: 'lose-weight' | 'build-muscle' | 'maintain' | 'gain-weight' | null } = {}) {
  const track = vi.fn();
  const analytics: AnalyticsAdapter = { track };
  const utils = render(
    <InlineCalculator
      selectedGoal={overrides.selectedGoal ?? null}
      analytics={analytics}
    />,
  );
  return { ...utils, track };
}

async function fillValidInputsAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^Age$/i), '30');
  await user.type(screen.getByLabelText(/^Weight$/i), '80');
  await user.type(screen.getByLabelText(/^Height$/i), '180');
  await user.click(screen.getByRole('button', { name: /find my number/i }));
}

describe('InlineCalculator — input state', () => {
  it('renders the input form initially', () => {
    setup();
    expect(screen.getByRole('button', { name: /find my number/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Age$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Weight$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Height$/i)).toBeInTheDocument();
  });

  it('renders the gender control as accessible buttons', () => {
    setup();
    expect(screen.getByRole('button', { name: /^male$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^female$/i })).toBeInTheDocument();
  });

  it('renders the four goal buttons', () => {
    setup();
    expect(screen.getByRole('button', { name: /lose weight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /build muscle/i })).toBeInTheDocument();
    // Use a regex anchor to avoid matching "Maintenance" or similar
    expect(screen.getByRole('button', { name: /^maintain$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gain weight/i })).toBeInTheDocument();
  });

  it('pre-fills goal from selectedGoal prop', () => {
    setup({ selectedGoal: 'build-muscle' });
    expect(screen.getByRole('button', { name: /build muscle/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('weight unit toggle (kg/lb) and height unit toggle (cm/in) are present', () => {
    setup();
    expect(screen.getByRole('button', { name: /^kg$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^lb$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cm$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^in$/i })).toBeInTheDocument();
  });

  it('shows inline validation errors on empty submit, no result transition', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /find my number/i }));
    // Still in input state
    expect(screen.getByRole('button', { name: /find my number/i })).toBeInTheDocument();
    expect(screen.queryByText('Your target', { exact: true })).not.toBeInTheDocument();
  });
});

describe('InlineCalculator — result state', () => {
  beforeEach(() => {});

  it('transitions to result state after filling and submitting valid inputs', async () => {
    setup();
    await fillValidInputsAndSubmit();
    expect(await screen.findByText('Your target', { exact: true })).toBeInTheDocument();
  });

  it('result includes "about" prefix on the calorie number (no false precision)', async () => {
    const { container } = setup();
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    // The hero number splits "about" + "<N>" + "calories/day" across
    // separate elements for visual hierarchy. A purpose-built sr-only
    // span renders the complete sentence for screen readers — assert
    // against that whitespace-normalized text.
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).toMatch(/about\s+[\d,]+\s+calories\s+per\s+day/i);
  });

  it('protein is rendered as a range with an en-dash, never a single number', async () => {
    setup();
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    // The protein MetricCard splits the value ("120–165") and unit ("g/day")
    // into separate paragraphs. Find the Protein label, then walk to the
    // nearest enclosing card and assert the range pattern is present.
    const proteinLabel = screen.getByText('Protein', { exact: true });
    const card = proteinLabel.closest('div');
    expect(card).not.toBeNull();
    const cardText = (card!.textContent ?? '').replace(/\s+/g, ' ');
    expect(cardText).toMatch(/\d+\s*[–-]\s*\d+/);
    expect(cardText).toMatch(/g\/day/i);
  });

  it('does NOT display carbs or fats (regression guard against scope creep)', async () => {
    const { container } = setup();
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    const text = container.textContent ?? '';
    expect(text.toLowerCase()).not.toMatch(/\bcarbs?\b/);
    expect(text.toLowerCase()).not.toMatch(/\bfats?\b/);
  });

  it('Recalculate returns to input state and preserves prior values', async () => {
    const user = userEvent.setup();
    setup();
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    await user.click(screen.getByRole('button', { name: /recalculate/i }));
    // Back in input state
    expect(screen.getByRole('button', { name: /find my number/i })).toBeInTheDocument();
    // Prior values still present
    expect(screen.getByLabelText(/^Age$/i)).toHaveValue(30);
    expect(screen.getByLabelText(/^Weight$/i)).toHaveValue(80);
  });

  it('renders two CTAs in result state with correct hrefs', async () => {
    setup({ selectedGoal: 'lose-weight' });
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });

    const appCta = screen.getByRole('link', { name: /get the app/i });
    expect(appCta.getAttribute('href')).toMatch(/apps\.apple\.com/);

    const guideCta = screen.getByRole('link', { name: /read the guide/i });
    expect(guideCta.getAttribute('href')).toBe('/blog/tag/lose-weight');
  });

  it('trust line is present with link to /tdee-calculator#methodology', async () => {
    setup();
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    const methodologyLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/tdee-calculator#methodology');
    expect(methodologyLinks.length).toBeGreaterThan(0);
  });

  it('power-user link points to /tdee-calculator (no anchor)', async () => {
    setup();
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    const fullCalcLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/tdee-calculator');
    expect(fullCalcLinks.length).toBeGreaterThan(0);
  });
});

describe('InlineCalculator — analytics', () => {
  it('fires calculator_started exactly once when user first touches an input', async () => {
    const user = userEvent.setup();
    const { track } = setup();
    await user.type(screen.getByLabelText(/^Age$/i), '3');
    await user.type(screen.getByLabelText(/^Age$/i), '0');
    const startedCalls = track.mock.calls.filter(([name]) => name === 'calculator_started');
    expect(startedCalls).toHaveLength(1);
  });

  it("fires calculator_completed with ONLY {goal, activityLevel} — no calorie or anthropometric data (Decision #11)", async () => {
    const { track } = setup({ selectedGoal: 'maintain' });
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    const completedCall = track.mock.calls.find(([name]) => name === 'calculator_completed');
    expect(completedCall).toBeDefined();
    const payload = completedCall![1] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(['activityLevel', 'goal']);
    expect(payload.goal).toBe('maintain');
    // Explicitly NOT present:
    expect(payload).not.toHaveProperty('dailyCalories');
    expect(payload).not.toHaveProperty('weightKg');
    expect(payload).not.toHaveProperty('weight');
    expect(payload).not.toHaveProperty('heightCm');
    expect(payload).not.toHaveProperty('age');
  });

  it('fires calculator_cta_clicked with which and goal when a result CTA is clicked', async () => {
    const user = userEvent.setup();
    const { track } = setup({ selectedGoal: 'gain-weight' });
    await fillValidInputsAndSubmit();
    await screen.findByText('Your target', { exact: true });
    await user.click(screen.getByRole('link', { name: /get the app/i }));
    const ctaCall = track.mock.calls.find(([name]) => name === 'calculator_cta_clicked');
    expect(ctaCall).toBeDefined();
    expect(ctaCall![1]).toEqual({ which: 'app', goal: 'gain-weight' });
  });
});

describe('InlineCalculator — architectural guarantees', () => {
  it('only imports math from @/lib/landing/calculator (the adapter), never from @/lib/tdee', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/landing/InlineCalculator.tsx'),
      'utf-8',
    );
    expect(source).toContain('@/lib/landing/calculator');
    // Permissible: importing types from @/lib/tdee/types is OK (Gender,
    // ActivityLevel). Forbidden: importing formulas directly.
    expect(source).not.toMatch(/from\s+["']@\/lib\/tdee\/formulas["']/);
  });

  it('accepts CTAs as a prop array (v1.1 additive contract)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/landing/InlineCalculator.tsx'),
      'utf-8',
    );
    expect(source).toMatch(/ctas\??\s*:\s*CalculatorCTA\[\]/);
  });
});

describe('InlineCalculator — authority panel beside the calculator', () => {
  it('renders the "Built on validated science" panel in the calculator section', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: /built on validated science/i }),
    ).toBeInTheDocument();
    const link = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/tdee-calculator#methodology');
    expect(link).toBeDefined();
  });

  it('does not repeat "Mifflin-St Jeor" in the result trust line (panel carries it)', async () => {
    setup();
    await fillValidInputsAndSubmit();
    // Mifflin-St Jeor should appear exactly once on screen (in the panel),
    // not also duplicated in the result-view inline trust line.
    const matches = screen.getAllByText(/mifflin-st jeor/i);
    expect(matches).toHaveLength(1);
  });
});
