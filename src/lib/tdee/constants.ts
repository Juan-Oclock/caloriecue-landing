import { ActivityLevel, MacroPlan } from "./types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extreme: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, { title: string; description: string }> = {
  sedentary: { title: "Sedentary", description: "Office job, little exercise" },
  light: { title: "Lightly Active", description: "Light exercise 1-3 days/week" },
  moderate: { title: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  very_active: { title: "Very Active", description: "Hard exercise 6-7 days/week" },
  extreme: { title: "Extra Active", description: "Very hard exercise, physical job" },
};

// Macro ratios as percentages [protein, carbs, fat]
export const MACRO_PRESETS: Record<MacroPlan, { label: string; protein: number; carbs: number; fat: number }> = {
  balanced: { label: "Balanced", protein: 30, carbs: 35, fat: 35 },
  low_carb: { label: "Low Carb", protein: 40, carbs: 20, fat: 40 },
  high_carb: { label: "High Carb", protein: 30, carbs: 50, fat: 20 },
};

export const GOAL_OFFSETS: Record<string, number> = {
  cut: -500,
  maintain: 0,
  bulk: 500,
};

export const BMI_CATEGORIES = [
  { max: 18.5, label: "Underweight", color: "text-blue-600", bg: "bg-blue-100" },
  { max: 25, label: "Normal", color: "text-green-600", bg: "bg-green-100" },
  { max: 30, label: "Overweight", color: "text-amber-600", bg: "bg-amber-100" },
  { max: Infinity, label: "Obese", color: "text-red-600", bg: "bg-red-100" },
];

export const MEAL_SPLIT = [
  { label: "Breakfast", percent: 25 },
  { label: "Lunch", percent: 35 },
  { label: "Dinner", percent: 30 },
  { label: "Snacks", percent: 10 },
];
