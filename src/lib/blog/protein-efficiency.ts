export type ProteinEfficiencyCategory =
  | "snack"
  | "breakfast"
  | "dairy"
  | "plant"
  | "convenience";

export type ProteinEfficiencyFood = {
  id: string;
  name: string;
  category: ProteinEfficiencyCategory;
  serving: string;
  calories: number;
  proteinGrams: number;
  swapTargetId: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type ProteinSortKey =
  | "calories"
  | "proteinGrams"
  | "proteinPer100Calories"
  | "proteinCost";

export type SortDirection = "asc" | "desc";

const sourceUrl = (query: string) =>
  `https://fdc.nal.usda.gov/food-search/?query=${encodeURIComponent(query).replace(/%20/g, "+")}`;

const food = (
  value: Omit<ProteinEfficiencyFood, "sourceUrl"> & { sourceQuery: string },
): ProteinEfficiencyFood => {
  const { sourceQuery, ...record } = value;
  return { ...record, sourceUrl: sourceUrl(sourceQuery) };
};

export const PROTEIN_EFFICIENCY_FOODS: readonly ProteinEfficiencyFood[] = [
  food({ id: "peanut-butter", name: "Peanut butter, smooth", category: "snack", serving: "2 tbsp (32 g)", calories: 188, proteinGrams: 8, swapTargetId: "greek-yogurt-nonfat", sourceLabel: "USDA FoodData Central — Peanut butter, creamy", sourceQuery: "peanut butter creamy" }),
  food({ id: "almonds", name: "Almonds", category: "snack", serving: "1 oz (28 g)", calories: 164, proteinGrams: 6, swapTargetId: "cottage-cheese-lowfat", sourceLabel: "USDA FoodData Central — Nuts, almonds", sourceQuery: "nuts almonds raw" }),
  food({ id: "walnuts", name: "Walnuts", category: "snack", serving: "1 oz (28 g)", calories: 185, proteinGrams: 4.3, swapTargetId: "cottage-cheese-lowfat", sourceLabel: "USDA FoodData Central — Nuts, walnuts, English", sourceQuery: "nuts walnuts English" }),
  food({ id: "sunflower-seeds", name: "Sunflower seed kernels", category: "snack", serving: "1 oz (28 g)", calories: 165, proteinGrams: 5.9, swapTargetId: "edamame", sourceLabel: "USDA FoodData Central — Seeds, sunflower seed kernels", sourceQuery: "sunflower seed kernels dry roasted" }),
  food({ id: "chia-seeds", name: "Chia seeds", category: "breakfast", serving: "1 oz (28 g)", calories: 138, proteinGrams: 4.7, swapTargetId: "edamame", sourceLabel: "USDA FoodData Central — Seeds, chia seeds", sourceQuery: "seeds chia seeds dried" }),
  food({ id: "granola", name: "Plain granola", category: "breakfast", serving: "1/2 cup (50 g)", calories: 235, proteinGrams: 6.85, swapTargetId: "greek-yogurt-nonfat", sourceLabel: "USDA FoodData Central — Cereals ready-to-eat, granola, homemade", sourceQuery: "cereals ready-to-eat granola homemade" }),
  food({ id: "whole-wheat-bread", name: "Whole-wheat bread", category: "breakfast", serving: "2 slices (56 g)", calories: 138, proteinGrams: 7.3, swapTargetId: "egg-whites", sourceLabel: "USDA FoodData Central — Bread, whole-wheat, commercially prepared", sourceQuery: "bread whole wheat commercially prepared" }),
  food({ id: "egg-whites", name: "Egg whites", category: "breakfast", serving: "100 g", calories: 52, proteinGrams: 10.9, swapTargetId: "greek-yogurt-nonfat", sourceLabel: "USDA FoodData Central — Egg, white, raw, fresh", sourceQuery: "egg white raw fresh" }),
  food({ id: "cheddar", name: "Cheddar cheese", category: "dairy", serving: "1 oz (28 g)", calories: 113, proteinGrams: 6.524, swapTargetId: "cottage-cheese-lowfat", sourceLabel: "USDA FoodData Central — Cheese, cheddar", sourceQuery: "cheese cheddar" }),
  food({ id: "cream-cheese", name: "Cream cheese", category: "dairy", serving: "2 tbsp (29 g)", calories: 100, proteinGrams: 1.6791, swapTargetId: "greek-yogurt-nonfat", sourceLabel: "USDA FoodData Central — Cream cheese, full fat, block", sourceQuery: "cheese cream" }),
  food({ id: "whole-milk", name: "Whole milk", category: "dairy", serving: "1 cup (244 g)", calories: 149, proteinGrams: 7.7, swapTargetId: "greek-yogurt-nonfat", sourceLabel: "USDA FoodData Central — Milk, whole, 3.25% milkfat", sourceQuery: "milk whole 3.25 milkfat" }),
  food({ id: "greek-yogurt-nonfat", name: "Greek yogurt, plain, nonfat", category: "dairy", serving: "170 g single-serve cup", calories: 100, proteinGrams: 17.3, swapTargetId: "cottage-cheese-lowfat", sourceLabel: "USDA FoodData Central — Greek yogurt, plain, nonfat", sourceQuery: "Greek yogurt plain nonfat" }),
  food({ id: "cottage-cheese-lowfat", name: "Cottage cheese, 1%", category: "dairy", serving: "1 cup (226 g)", calories: 163, proteinGrams: 28, swapTargetId: "greek-yogurt-nonfat", sourceLabel: "USDA FoodData Central — Cheese, cottage, lowfat, 1% milkfat", sourceQuery: "cottage cheese lowfat 1 percent" }),
  food({ id: "hummus", name: "Prepared hummus", category: "plant", serving: "1/4 cup (60 g)", calories: 106.2, proteinGrams: 2.916, swapTargetId: "tofu-firm", sourceLabel: "USDA FoodData Central — Hummus, home prepared", sourceQuery: "hummus home prepared" }),
  food({ id: "falafel", name: "Falafel", category: "plant", serving: "3 patties (75 g)", calories: 250, proteinGrams: 10, swapTargetId: "tofu-firm", sourceLabel: "USDA FoodData Central — Falafel, home-prepared", sourceQuery: "falafel home prepared" }),
  food({ id: "black-beans", name: "Black beans, cooked", category: "plant", serving: "1 cup (172 g)", calories: 227, proteinGrams: 15.2, swapTargetId: "tofu-firm", sourceLabel: "USDA FoodData Central — Beans, black, cooked", sourceQuery: "beans black cooked boiled" }),
  food({ id: "quinoa", name: "Quinoa, cooked", category: "plant", serving: "1 cup (185 g)", calories: 222, proteinGrams: 8.1, swapTargetId: "edamame", sourceLabel: "USDA FoodData Central — Quinoa, cooked", sourceQuery: "quinoa cooked" }),
  food({ id: "avocado", name: "Avocado", category: "plant", serving: "1/2 large (100 g)", calories: 160, proteinGrams: 2, swapTargetId: "edamame", sourceLabel: "USDA FoodData Central — Avocados, raw, all commercial varieties", sourceQuery: "avocado raw commercial varieties" }),
  food({ id: "tofu-firm", name: "Firm tofu", category: "plant", serving: "100 g", calories: 144, proteinGrams: 17.3, swapTargetId: "edamame", sourceLabel: "USDA FoodData Central — Tofu, raw, firm, prepared with calcium sulfate", sourceQuery: "tofu raw firm prepared calcium sulfate" }),
  food({ id: "edamame", name: "Edamame, prepared", category: "plant", serving: "1 cup shelled (155 g)", calories: 188, proteinGrams: 18.4, swapTargetId: "tofu-firm", sourceLabel: "USDA FoodData Central — Edamame, frozen, prepared", sourceQuery: "edamame frozen prepared" }),
  food({ id: "potato-chips", name: "Plain potato chips", category: "convenience", serving: "1 oz (28 g)", calories: 152, proteinGrams: 1.7892, swapTargetId: "turkey-breast", sourceLabel: "USDA FoodData Central — Snacks, potato chips, plain, salted", sourceQuery: "snacks potato chips plain salted" }),
  food({ id: "tortilla-chips", name: "Plain tortilla chips", category: "convenience", serving: "1 oz (28 g)", calories: 139, proteinGrams: 1.988, swapTargetId: "tuna-water", sourceLabel: "USDA FoodData Central — Snacks, tortilla chips, plain, white corn, salted", sourceQuery: "snacks tortilla chips plain white corn salted" }),
  food({ id: "french-fries", name: "Restaurant-style french fries", category: "convenience", serving: "100 g", calories: 312, proteinGrams: 3.4, swapTargetId: "shrimp-cooked", sourceLabel: "USDA FoodData Central — Fast foods, potato, french fried in vegetable oil", sourceQuery: "fast foods potato french fried vegetable oil" }),
  food({ id: "bacon", name: "Cooked bacon", category: "convenience", serving: "3 slices (24 g)", calories: 112.32, proteinGrams: 8.136, swapTargetId: "turkey-breast", sourceLabel: "USDA FoodData Central — Pork, cured, bacon, pre-sliced, cooked, pan-fried", sourceQuery: "pork cured bacon pre sliced cooked pan fried" }),
  food({ id: "pork-sausage", name: "Cooked pork sausage", category: "convenience", serving: "2 links (90 g)", calories: 305, proteinGrams: 17.5, swapTargetId: "chicken-breast", sourceLabel: "USDA FoodData Central — Pork sausage, link/patty, cooked, pan-fried", sourceQuery: "pork sausage link patty cooked pan fried" }),
  food({ id: "chicken-breast", name: "Chicken breast, roasted", category: "convenience", serving: "100 g", calories: 165, proteinGrams: 31, swapTargetId: "turkey-breast", sourceLabel: "USDA FoodData Central — Chicken, broilers or fryers, breast, meat only, cooked, roasted", sourceQuery: "chicken broilers fryers breast meat only cooked roasted" }),
  food({ id: "turkey-breast", name: "Turkey breast, roasted", category: "convenience", serving: "100 g", calories: 147, proteinGrams: 30.1, swapTargetId: "chicken-breast", sourceLabel: "USDA FoodData Central — Turkey, whole, breast, meat only, cooked, roasted", sourceQuery: "turkey whole breast meat only cooked roasted" }),
  food({ id: "tuna-water", name: "Tuna, canned in water", category: "convenience", serving: "100 g drained", calories: 116, proteinGrams: 25.5, swapTargetId: "shrimp-cooked", sourceLabel: "USDA FoodData Central — Fish, tuna, light, canned in water, without salt, drained solids", sourceQuery: "fish tuna light canned water without salt drained solids" }),
  food({ id: "shrimp-cooked", name: "Shrimp, cooked", category: "convenience", serving: "100 g", calories: 99, proteinGrams: 24, swapTargetId: "cod-cooked", sourceLabel: "USDA FoodData Central — Crustaceans, shrimp, cooked", sourceQuery: "crustaceans shrimp cooked" }),
  food({ id: "cod-cooked", name: "Pacific cod, cooked", category: "convenience", serving: "100 g", calories: 85, proteinGrams: 18.7, swapTargetId: "shrimp-cooked", sourceLabel: "USDA FoodData Central — Fish, cod, Pacific, cooked, dry heat (may contain additives to retain moisture)", sourceQuery: "fish cod Pacific cooked dry heat" }),
];

function assertPositiveCalories(foodValue: ProteinEfficiencyFood): void {
  if (!Number.isFinite(foodValue.calories) || foodValue.calories <= 0) {
    throw new RangeError("Calories must be a positive finite number");
  }
}

function assertNonNegativeProtein(foodValue: ProteinEfficiencyFood): void {
  if (!Number.isFinite(foodValue.proteinGrams) || foodValue.proteinGrams < 0) {
    throw new RangeError("Protein must be a finite non-negative number");
  }
}

export function proteinPer100Calories(foodValue: ProteinEfficiencyFood): number {
  assertPositiveCalories(foodValue);
  assertNonNegativeProtein(foodValue);
  return (foodValue.proteinGrams / foodValue.calories) * 100;
}

export function caloriesPer10gProtein(foodValue: ProteinEfficiencyFood): number | null {
  assertPositiveCalories(foodValue);
  assertNonNegativeProtein(foodValue);
  if (foodValue.proteinGrams === 0) return null;
  return (foodValue.calories / foodValue.proteinGrams) * 10;
}

export function sameCaloriesProtein(
  selected: ProteinEfficiencyFood,
  comparison: ProteinEfficiencyFood,
): number {
  assertPositiveCalories(selected);
  assertPositiveCalories(comparison);
  assertNonNegativeProtein(comparison);
  return (selected.calories * comparison.proteinGrams) / comparison.calories;
}

export function sameProteinCalories(
  selected: ProteinEfficiencyFood,
  comparison: ProteinEfficiencyFood,
): number | null {
  assertPositiveCalories(selected);
  assertPositiveCalories(comparison);
  assertNonNegativeProtein(selected);
  assertNonNegativeProtein(comparison);
  if (comparison.proteinGrams === 0) return null;
  return (selected.proteinGrams * comparison.calories) / comparison.proteinGrams;
}

export function filterFoods(
  foods: readonly ProteinEfficiencyFood[],
  category: ProteinEfficiencyCategory | "all",
): ProteinEfficiencyFood[] {
  return category === "all" ? [...foods] : foods.filter((foodValue) => foodValue.category === category);
}

function sortValue(foodValue: ProteinEfficiencyFood, key: ProteinSortKey): number | null {
  if (key === "calories") return foodValue.calories;
  if (key === "proteinGrams") return foodValue.proteinGrams;
  if (key === "proteinPer100Calories") return proteinPer100Calories(foodValue);
  return caloriesPer10gProtein(foodValue);
}

export function sortFoods(
  foods: readonly ProteinEfficiencyFood[],
  key: ProteinSortKey,
  direction: SortDirection,
): ProteinEfficiencyFood[] {
  return [...foods].sort((left, right) => {
    const a = sortValue(left, key);
    const b = sortValue(right, key);
    if (a === null) return b === null ? 0 : 1;
    if (b === null) return -1;
    return direction === "asc" ? a - b : b - a;
  });
}

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export function serializeProteinFoodsCsv(foods: readonly ProteinEfficiencyFood[]): string {
  const header = [
    "Food",
    "Category",
    "Serving",
    "Calories",
    "Protein (g)",
    "Protein per 100 calories (g)",
    "Protein Cost (calories per 10 g protein)",
    "USDA source",
  ];
  const rows = foods.map((foodValue) => [
    foodValue.name,
    foodValue.category,
    foodValue.serving,
    foodValue.calories,
    foodValue.proteinGrams,
    proteinPer100Calories(foodValue).toFixed(1),
    caloriesPer10gProtein(foodValue)?.toFixed(0) ?? "Not a meaningful protein source",
    foodValue.sourceUrl,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function validateProteinEfficiencyFoods(
  foods: readonly ProteinEfficiencyFood[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const foodValue of foods) {
    if (ids.has(foodValue.id)) errors.push(`Duplicate id: ${foodValue.id}`);
    ids.add(foodValue.id);
    if (!foodValue.id || !foodValue.name || !foodValue.serving) errors.push(`Missing identity field: ${foodValue.id}`);
    if (!Number.isFinite(foodValue.calories) || foodValue.calories <= 0) errors.push(`Invalid calories: ${foodValue.id}`);
    if (!Number.isFinite(foodValue.proteinGrams) || foodValue.proteinGrams < 0) errors.push(`Invalid protein: ${foodValue.id}`);
    if (!foodValue.sourceLabel.startsWith("USDA FoodData Central — ")) errors.push(`Invalid source label: ${foodValue.id}`);
    if (!foodValue.sourceUrl.startsWith("https://fdc.nal.usda.gov/food-search/?query=")) errors.push(`Invalid source URL: ${foodValue.id}`);
  }
  for (const foodValue of foods) {
    if (!ids.has(foodValue.swapTargetId)) errors.push(`Missing swap target: ${foodValue.id} -> ${foodValue.swapTargetId}`);
  }
  return errors;
}
