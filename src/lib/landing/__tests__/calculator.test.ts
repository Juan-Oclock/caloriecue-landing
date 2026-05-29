import { describe, it, expect } from 'vitest';
import {
  getHomepageCalculatorResult,
  type HomepageCalculatorInput,
  type Goal,
} from '@/lib/landing/calculator';

function baseInput(overrides: Partial<HomepageCalculatorInput> = {}): HomepageCalculatorInput {
  return {
    gender: 'male',
    age: 30,
    weightKg: 80,
    heightCm: 180,
    activityLevel: 'moderate',
    goal: 'maintain',
    ...overrides,
  };
}

describe('getHomepageCalculatorResult', () => {
  it("'lose-weight' returns dailyCalories < maintenanceCalories", () => {
    const result = getHomepageCalculatorResult(baseInput({ goal: 'lose-weight' }));
    expect(result.dailyCalories).toBeLessThan(result.maintenanceCalories);
    expect(result.maintenanceCalories - result.dailyCalories).toBe(500);
  });

  it("'gain-weight' returns dailyCalories > maintenanceCalories", () => {
    const result = getHomepageCalculatorResult(baseInput({ goal: 'gain-weight' }));
    expect(result.dailyCalories).toBeGreaterThan(result.maintenanceCalories);
    expect(result.dailyCalories - result.maintenanceCalories).toBe(500);
  });

  it("'build-muscle' returns a modest surplus (+250 kcal)", () => {
    const result = getHomepageCalculatorResult(baseInput({ goal: 'build-muscle' }));
    expect(result.dailyCalories - result.maintenanceCalories).toBe(250);
  });

  it("'maintain' returns dailyCalories === maintenanceCalories", () => {
    const result = getHomepageCalculatorResult(baseInput({ goal: 'maintain' }));
    expect(result.dailyCalories).toBe(result.maintenanceCalories);
  });

  it('protein range tuple [low, high] satisfies low < high and both positive integers', () => {
    const [low, high] = getHomepageCalculatorResult(baseInput()).proteinRangeGrams;
    expect(low).toBeLessThan(high);
    expect(Number.isInteger(low)).toBe(true);
    expect(Number.isInteger(high)).toBe(true);
    expect(low).toBeGreaterThan(0);
  });

  it('goalPaceLabel is a non-empty string and varies per goal', () => {
    const goals: Goal[] = ['lose-weight', 'build-muscle', 'maintain', 'gain-weight'];
    const labels = goals.map((g) => getHomepageCalculatorResult(baseInput({ goal: g })).goalPaceLabel);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
    }
    expect(new Set(labels).size).toBe(goals.length);
  });

  it('nextStepText is non-empty and identical across goals (shared text)', () => {
    const goals: Goal[] = ['lose-weight', 'build-muscle', 'maintain', 'gain-weight'];
    const texts = goals.map((g) => getHomepageCalculatorResult(baseInput({ goal: g })).nextStepText);
    expect(texts[0].length).toBeGreaterThan(0);
    expect(new Set(texts).size).toBe(1);
  });

  it('nextStepText names CalorieCue (Guardrail 3 — app visible in calculator result)', () => {
    const result = getHomepageCalculatorResult(baseInput({ goal: 'lose-weight' }));
    expect(result.nextStepText).toContain('CalorieCue');
  });

  it('uses the existing Mifflin-St Jeor + activity multiplier for maintenanceCalories', () => {
    // 30yo male, 80kg, 180cm, moderate (1.55):
    // BMR = 1780; TDEE = round(1780 * 1.55) = 2759
    const result = getHomepageCalculatorResult(baseInput({ activityLevel: 'moderate' }));
    expect(result.maintenanceCalories).toBe(2759);
  });

  describe('input validation', () => {
    it('throws on non-positive age', () => {
      expect(() => getHomepageCalculatorResult(baseInput({ age: 0 }))).toThrow(RangeError);
      expect(() => getHomepageCalculatorResult(baseInput({ age: -1 }))).toThrow(RangeError);
    });

    it('throws on non-positive weight', () => {
      expect(() => getHomepageCalculatorResult(baseInput({ weightKg: 0 }))).toThrow(RangeError);
    });

    it('throws on non-positive height', () => {
      expect(() => getHomepageCalculatorResult(baseInput({ heightCm: 0 }))).toThrow(RangeError);
    });

    it('throws on non-finite inputs', () => {
      expect(() => getHomepageCalculatorResult(baseInput({ age: NaN }))).toThrow(RangeError);
      expect(() => getHomepageCalculatorResult(baseInput({ weightKg: Infinity }))).toThrow(RangeError);
    });
  });
});
