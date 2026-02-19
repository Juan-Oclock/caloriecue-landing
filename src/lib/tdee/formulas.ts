import { ActivityLevel, Gender, MacroPlan } from "./types";
import { ACTIVITY_MULTIPLIERS, ACTIVITY_LABELS, BMI_CATEGORIES, MACRO_PRESETS, GOAL_OFFSETS } from "./constants";
import type { BMRResults, TDEEResults, MacroBreakdownResult, WeeklyDataPoint, IdealWeightResult, ActivityBreakdownItem } from "./types";

// --- Unit converters ---
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function kgToLbs(kg: number): number {
  return kg / 0.453592;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// --- BMR formulas ---
export function calculateBMR_MifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateBMR_HarrisBenedict(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  if (gender === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function calculateBMR_KatchMcArdle(
  weightKg: number,
  bodyFatPercent: number
): number {
  const leanMass = weightKg * (1 - bodyFatPercent / 100);
  return 370 + 21.6 * leanMass;
}

// --- TDEE ---
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// --- BMI ---
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number): { label: string; color: string; bg: string } {
  for (const cat of BMI_CATEGORIES) {
    if (bmi < cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

// --- Macros ---
export function calculateMacros(calories: number, plan: MacroPlan): MacroBreakdownResult {
  const preset = MACRO_PRESETS[plan];
  const proteinCalories = calories * (preset.protein / 100);
  const carbsCalories = calories * (preset.carbs / 100);
  const fatCalories = calories * (preset.fat / 100);

  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
    proteinCalories: Math.round(proteinCalories),
    carbsCalories: Math.round(carbsCalories),
    fatCalories: Math.round(fatCalories),
  };
}

// --- Ideal Weight (height-based formulas) ---
export function calculateIdealWeight(heightCm: number, gender: Gender): IdealWeightResult[] {
  const inchesOver60 = (heightCm / 2.54) - 60;

  const formulas: { name: string; year: number; male: (i: number) => number; female: (i: number) => number }[] = [
    { name: "Hamwi", year: 1964, male: (i) => 48.0 + 2.7 * i, female: (i) => 45.5 + 2.2 * i },
    { name: "Devine", year: 1974, male: (i) => 50.0 + 2.3 * i, female: (i) => 45.5 + 2.3 * i },
    { name: "Robinson", year: 1983, male: (i) => 52.0 + 1.9 * i, female: (i) => 49.0 + 1.7 * i },
    { name: "Miller", year: 1983, male: (i) => 56.2 + 1.41 * i, female: (i) => 53.1 + 1.36 * i },
  ];

  return formulas.map((f) => ({
    formula: f.name,
    year: f.year,
    weightKg: Math.round(gender === "male" ? f.male(inchesOver60) : f.female(inchesOver60)),
  }));
}

// --- Activity Level Breakdown ---
export function calculateActivityBreakdown(bmr: number, currentLevel: ActivityLevel): ActivityBreakdownItem[] {
  return (Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => ({
    level,
    label: ACTIVITY_LABELS[level].title,
    calories: Math.round(bmr * ACTIVITY_MULTIPLIERS[level]),
    active: level === currentLevel,
  }));
}

// --- Full calculation ---
export function calculateAll(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  bodyFatPercent: number | null
): TDEEResults {
  const mifflinStJeor = calculateBMR_MifflinStJeor(weightKg, heightCm, age, gender);
  const harrisBenedict = calculateBMR_HarrisBenedict(weightKg, heightCm, age, gender);
  const katchMcArdle = bodyFatPercent !== null
    ? calculateBMR_KatchMcArdle(weightKg, bodyFatPercent)
    : null;

  const primaryBMR = mifflinStJeor;
  const tdee = calculateTDEE(primaryBMR, activityLevel);
  const bmi = calculateBMI(weightKg, heightCm);

  return {
    tdee,
    bmr: { mifflinStJeor: Math.round(mifflinStJeor), harrisBenedict: Math.round(harrisBenedict), katchMcArdle: katchMcArdle !== null ? Math.round(katchMcArdle) : null },
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: getBMICategory(bmi).label,
    goals: {
      cut: tdee + GOAL_OFFSETS.cut,
      maintain: tdee + GOAL_OFFSETS.maintain,
      bulk: tdee + GOAL_OFFSETS.bulk,
    },
  };
}

// --- Weight projection ---
export function calculateWeeklyProjection(
  currentWeightKg: number,
  tdee: number,
  targetCalories: number,
  weeks: number = 12
): WeeklyDataPoint[] {
  const points: WeeklyDataPoint[] = [];
  let weight = currentWeightKg;
  const dailyDeficit = targetCalories - tdee; // negative = loss, positive = gain
  const weeklyWeightChangeKg = (dailyDeficit * 7) / 7700; // ~7700 cal per kg

  for (let week = 0; week <= weeks; week++) {
    points.push({ week, weight: Math.round(weight * 10) / 10 });
    weight += weeklyWeightChangeKg;
  }

  return points;
}
