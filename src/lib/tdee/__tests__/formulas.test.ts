import { describe, it, expect } from 'vitest';
import {
  calculateBMR_MifflinStJeor,
  calculateTDEE,
  calculateProteinRangeGrams,
} from '@/lib/tdee/formulas';

describe('calculateBMR_MifflinStJeor', () => {
  it('matches the textbook reference for a 30yo male, 80kg, 180cm', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 1780
    expect(calculateBMR_MifflinStJeor(80, 180, 30, 'male')).toBeCloseTo(1780, 2);
  });

  it('matches the textbook reference for a 30yo female, 65kg, 165cm', () => {
    // 10*65 + 6.25*165 - 5*30 - 161 = 1370.25
    expect(calculateBMR_MifflinStJeor(65, 165, 30, 'female')).toBeCloseTo(1370.25, 2);
  });
});

describe('calculateTDEE', () => {
  const bmr = 1780;

  it('multiplies BMR by the sedentary multiplier (1.2) and rounds', () => {
    expect(calculateTDEE(bmr, 'sedentary')).toBe(Math.round(bmr * 1.2)); // 2136
  });

  it('multiplies BMR by the moderate multiplier (1.55) and rounds', () => {
    expect(calculateTDEE(bmr, 'moderate')).toBe(Math.round(bmr * 1.55)); // 2759
  });

  it('multiplies BMR by the extreme multiplier (1.9) and rounds', () => {
    expect(calculateTDEE(bmr, 'extreme')).toBe(Math.round(bmr * 1.9)); // 3382
  });
});

describe('calculateProteinRangeGrams', () => {
  it('returns [1.6*weightKg, 2.2*weightKg] rounded to integers', () => {
    expect(calculateProteinRangeGrams(80)).toEqual([128, 176]);
  });

  it('rounds non-integer results', () => {
    // 1.6 * 77 = 123.2 → 123; 2.2 * 77 = 169.4 → 169
    expect(calculateProteinRangeGrams(77)).toEqual([123, 169]);
  });

  it('returns a tuple where low < high and both are positive integers', () => {
    const [low, high] = calculateProteinRangeGrams(72);
    expect(low).toBeLessThan(high);
    expect(Number.isInteger(low)).toBe(true);
    expect(Number.isInteger(high)).toBe(true);
    expect(low).toBeGreaterThan(0);
  });
});
