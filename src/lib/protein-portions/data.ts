// USDA FoodData Central SR Legacy April 2018 download, checked 2026-10-23.
// Values are per 100 g edible food in the stated preparation state.
export const PORTION_SLUG = "what-does-30g-of-protein-look-like";
export const PORTION_PDF = "caloriecue-30g-protein-portions.pdf";
export const portionFoods = [
  { id: "chicken", name: "Chicken breast", state: "Cooked, roasted, skinless meat", grams: 100, cue: "About 3/4 cup, chopped", protein100: 31, kcal100: 165, fdcId: 171477, plant: false },
  { id: "tuna", name: "Canned light tuna", state: "In water, without salt, drained solids", grams: 120, cue: "Weigh the drained fish, not the can", protein100: 25.5, kcal100: 116, fdcId: 171986, plant: false },
  { id: "yogurt", name: "Plain nonfat Greek yogurt", state: "Ready to eat; generic USDA reference", grams: 300, cue: "About 1 3/4 of a 170 g container", protein100: 10.2, kcal100: 59, fdcId: 170894, plant: false },
  { id: "cottage", name: "Cottage cheese, 1%", state: "Ready to eat", grams: 245, cue: "Just over 1 cup, not packed", protein100: 12.4, kcal100: 72, fdcId: 173417, plant: false },
  { id: "tofu", name: "Firm tofu", state: "Uncooked, calcium-sulfate-set reference", grams: 175, cue: "Just under half of a 400 g pack", protein100: 17.3, kcal100: 144, fdcId: 172475, plant: true },
  { id: "edamame", name: "Shelled edamame", state: "Frozen, prepared; beans only, no pods", grams: 250, cue: "About 1 2/3 cups", protein100: 11.9, kcal100: 121, fdcId: 168411, plant: true },
  { id: "lentils", name: "Lentils", state: "Cooked, boiled, without salt", grams: 335, cue: "About 1 2/3 cups", protein100: 9.02, kcal100: 116, fdcId: 172421, plant: true },
  { id: "eggs", name: "Whole eggs", state: "Hard-boiled, shells removed", grams: 250, cue: "5 large eggs (50 g edible weight each)", protein100: 12.6, kcal100: 155, fdcId: 173424, plant: false },
] as const;
export type FoodId = (typeof portionFoods)[number]["id"];
export const sourceUrl = (id: number) => `https://fdc.nal.usda.gov/food-details/${id}/nutrients`;
export function nutrients(id: FoodId, grams: number) {
  const food = portionFoods.find((item) => item.id === id)!;
  return { protein: food.protein100 * grams / 100, calories: food.kcal100 * grams / 100 };
}
export const mealBases: { name: string; portions: { id: FoodId; grams: number }[]; description: string }[] = [
  { name: "Eggs + yogurt", portions: [{ id: "eggs", grams: 100 }, { id: "yogurt", grams: 175 }], description: "2 large hard-boiled eggs + 175 g plain nonfat Greek yogurt" },
  { name: "Tofu + lentils", portions: [{ id: "tofu", grams: 125 }, { id: "lentils", grams: 100 }], description: "125 g firm tofu, weighed before cooking + 100 g cooked lentils" },
  { name: "Edamame + lentils", portions: [{ id: "edamame", grams: 150 }, { id: "lentils", grams: 135 }], description: "150 g prepared shelled edamame + 135 g cooked lentils" },
  { name: "Chicken + lentils", portions: [{ id: "chicken", grams: 75 }, { id: "lentils", grams: 75 }], description: "75 g cooked chicken breast + 75 g cooked lentils" },
];
export function mealTotals(meal: (typeof mealBases)[number]) {
  return meal.portions.reduce((sum, part) => {
    const n = nutrients(part.id, part.grams);
    return { protein: sum.protein + n.protein, calories: sum.calories + n.calories };
  }, { protein: 0, calories: 0 });
}

// Correct binary floating-point noise before rounding reference values to 0.1 g.
export const proteinLabel = (grams: number) => (Math.round((grams + 1e-9) * 10) / 10).toFixed(1);
