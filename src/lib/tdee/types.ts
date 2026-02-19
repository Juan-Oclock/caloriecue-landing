export type Gender = "male" | "female";
export type UnitSystem = "imperial" | "metric";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "extreme";
export type MacroPlan = "balanced" | "low_carb" | "high_carb";
export type GoalType = "cut" | "maintain" | "bulk";

export interface UserInputs {
  gender: Gender;
  age: number;
  weight: number; // lbs or kg depending on unitSystem
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  bodyFatPercent: number | null;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
}

export interface BMRResults {
  mifflinStJeor: number;
  harrisBenedict: number;
  katchMcArdle: number | null;
}

export interface TDEEResults {
  tdee: number;
  bmr: BMRResults;
  bmi: number;
  bmiCategory: string;
  goals: {
    cut: number;
    maintain: number;
    bulk: number;
  };
}

export interface MacroBreakdownResult {
  protein: number;
  carbs: number;
  fat: number;
  proteinCalories: number;
  carbsCalories: number;
  fatCalories: number;
}

export interface WeeklyDataPoint {
  week: number;
  weight: number;
}

export interface IdealWeightResult {
  formula: string;
  year: number;
  weightKg: number;
}

export interface ActivityBreakdownItem {
  level: ActivityLevel;
  label: string;
  calories: number;
  active: boolean;
}
