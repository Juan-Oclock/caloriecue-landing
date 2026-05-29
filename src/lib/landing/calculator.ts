import type { Gender, ActivityLevel } from '@/lib/tdee/types';
import {
  calculateBMR_MifflinStJeor,
  calculateTDEE,
  calculateProteinRangeGrams,
  lbsToKg as tdeeLbsToKg,
  kgToLbs as tdeeKgToLbs,
} from '@/lib/tdee/formulas';

/** Re-exported unit converters so landing components don't reach into
 *  @/lib/tdee directly. Implementation is shared with /tdee-calculator. */
export const lbsToKg = tdeeLbsToKg;
export const kgToLbs = tdeeKgToLbs;
export const inchesToCm = (inches: number): number => inches * 2.54;
export const cmToInches = (cm: number): number => cm / 2.54;

export type Goal = 'lose-weight' | 'build-muscle' | 'maintain' | 'gain-weight';

export interface HomepageCalculatorInput {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface HomepageCalculatorResult {
  /** Single-number daily calorie target for display (e.g. "about 1,850"). */
  dailyCalories: number;
  /** TDEE estimate at maintenance — shown as a reference line in the result. */
  maintenanceCalories: number;
  /** Tuple [low, high] in grams/day, e.g. [125, 145]. Always a range, never a single number. */
  proteinRangeGrams: [number, number];
  /** Plain-language pace text per goal (e.g. "Lose ~1 lb / 0.45 kg per week"). */
  goalPaceLabel: string;
  /** Generic "what to do next" copy shown under the target. Same across goals. */
  nextStepText: string;
}

// Encodes landing's 4-goal vocabulary as kcal offsets from TDEE.
// Kept here (not in src/lib/tdee/constants.ts) so the existing
// /tdee-calculator's GOAL_OFFSETS (cut/maintain/bulk = -500/0/+500)
// stays untouched.
const GOAL_CALORIE_OFFSETS: Record<Goal, number> = {
  'lose-weight': -500,
  maintain: 0,
  'build-muscle': 250, // modest lean surplus
  'gain-weight': 500,
};

const GOAL_PACE_LABELS: Record<Goal, string> = {
  'lose-weight': 'Lose ~1 lb / 0.45 kg per week',
  'build-muscle': 'Gain ~0.5 lb / 0.25 kg per week (lean surplus)',
  maintain: 'Maintain current weight',
  'gain-weight': 'Gain ~1 lb / 0.45 kg per week',
};

const NEXT_STEP_TEXT =
  'Track your meals for 7 days and adjust from your weekly average — CalorieCue logs each one from a photo in seconds.';

function requirePositive(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${field} must be a positive finite number; got ${value}`);
  }
}

/**
 * Compute the homepage calculator's result from form inputs.
 *
 * This is the single math entrypoint the InlineCalculator component
 * imports — the component does not import from `@/lib/tdee/*` directly.
 * Math uses the same Mifflin-St Jeor + activity-multiplier path as the
 * full `/tdee-calculator` page, so the two calculators cannot drift.
 *
 * Throws `RangeError` for non-positive or non-finite age/weight/height.
 */
export function getHomepageCalculatorResult(
  input: HomepageCalculatorInput,
): HomepageCalculatorResult {
  requirePositive(input.age, 'age');
  requirePositive(input.weightKg, 'weightKg');
  requirePositive(input.heightCm, 'heightCm');

  const bmr = calculateBMR_MifflinStJeor(
    input.weightKg,
    input.heightCm,
    input.age,
    input.gender,
  );
  const maintenanceCalories = calculateTDEE(bmr, input.activityLevel);
  const dailyCalories = maintenanceCalories + GOAL_CALORIE_OFFSETS[input.goal];

  return {
    dailyCalories,
    maintenanceCalories,
    proteinRangeGrams: calculateProteinRangeGrams(input.weightKg),
    goalPaceLabel: GOAL_PACE_LABELS[input.goal],
    nextStepText: NEXT_STEP_TEXT,
  };
}
