export type MacroGramInput = {
  protein: number;
  carbs: number;
  fat: number;
  alcohol: number;
};

export type MacroCalorieBreakdown = {
  protein: number;
  carbs: number;
  fat: number;
  alcohol: number;
  total: number;
};

const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
  alcohol: 7,
} as const;

function assertValidGrams(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} grams must be a finite, non-negative number`);
  }
}

export function calculateMacroCalories(
  input: MacroGramInput,
): MacroCalorieBreakdown {
  assertValidGrams(input.protein, "Protein");
  assertValidGrams(input.carbs, "Carbohydrate");
  assertValidGrams(input.fat, "Fat");
  assertValidGrams(input.alcohol, "Alcohol");

  const protein = input.protein * CALORIES_PER_GRAM.protein;
  const carbs = input.carbs * CALORIES_PER_GRAM.carbs;
  const fat = input.fat * CALORIES_PER_GRAM.fat;
  const alcohol = input.alcohol * CALORIES_PER_GRAM.alcohol;

  return {
    protein,
    carbs,
    fat,
    alcohol,
    total: protein + carbs + fat + alcohol,
  };
}
