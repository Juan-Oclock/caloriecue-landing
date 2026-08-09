export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MacroFood = MacroTotals & {
  name: string;
  serving: string;
  note?: string;
};

export type MealItem = {
  name: string;
  macros: MacroTotals;
};

export type MealExample = {
  name: string;
  items: MealItem[];
  total: MacroTotals;
};

export function sumMacros(values: MacroTotals[]): MacroTotals {
  return values.reduce(
    (total, value) => ({
      calories: total.calories + value.calories,
      protein: total.protein + value.protein,
      carbs: total.carbs + value.carbs,
      fat: total.fat + value.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

// Rounded household-serving estimates. USDA FoodData Central records selected:
// poultry/meat — "Chicken, broilers or fryers, breast, meat only, cooked,
// roasted" (FDC 171477), "Turkey, whole, breast, meat only, cooked, roasted"
// (FDC 171496), "Turkey, ground, 93% lean, 7% fat, pan-broiled crumbles"
// (FDC 172851), "Beef, ground, 90% lean meat / 10% fat, crumbles, cooked,
// pan-browned" (FDC 171794), "Beef, top sirloin, steak, separable lean only,
// trimmed to 0 fat, choice, cooked, broiled" (FDC 168635), and "Pork, fresh,
// tenderloin, separable lean only, cooked,
// roasted" (FDC 168250).
// seafood — "Fish, tuna, light, canned in water, drained solids" (FDC
// 334194), "Fish, cod, Pacific, cooked, dry heat" (FDC 171990), "Fish,
// tilapia, cooked, dry heat" (FDC 175177), "Crustaceans, shrimp, cooked"
// (FDC 175180), and "Fish, salmon, Atlantic, farmed, cooked, dry heat"
// (FDC 175168).
// eggs/dairy/powder — "Egg, whole, cooked, hard-boiled" (FDC 173424),
// "Egg, white, raw, fresh" (FDC 172183), "Yogurt, Greek, plain, nonfat"
// (FDC 330137), "Yogurt, Greek, plain, lowfat" (FDC 170903), "Cheese,
// cottage, lowfat, 2% milkfat" (FDC 328841), "Milk, nonfat, fluid, with added
// vitamins A and D" (FDC 171269), and "Whey protein isolate, unflavored"
// (FDC 1844993).
// plant proteins — "Tofu, raw, firm, prepared with calcium sulfate" (FDC
// 172475), "Tempeh" (FDC 174272), "Vital wheat gluten" (FDC 168147),
// "Lentils, mature seeds,
// cooked, boiled, without salt" (FDC 172421), "Beans, black, mature seeds,
// cooked, boiled, without salt" (FDC 173735), "Edamame, frozen, prepared" (FDC
// 168411), and "Textured vegetable protein, dry" (FDC 2707451).
export const proteinFoods: MacroFood[] = [
  { name: "Chicken breast", serving: "4 oz cooked, skinless, roasted", calories: 187, protein: 35, carbs: 0, fat: 4 },
  { name: "Turkey breast", serving: "4 oz cooked, skinless, roasted", calories: 153, protein: 34, carbs: 0, fat: 2 },
  { name: "Ground turkey (93%)", serving: "4 oz cooked, pan-browned", calories: 203, protein: 27, carbs: 0, fat: 10 },
  { name: "Ground beef (90%)", serving: "4 oz cooked, pan-browned", calories: 230, protein: 28, carbs: 0, fat: 13 },
  { name: "Top sirloin", serving: "4 oz cooked, broiled, lean only", calories: 207, protein: 34, carbs: 0, fat: 8 },
  { name: "Pork tenderloin", serving: "4 oz cooked, roasted, lean only", calories: 167, protein: 30, carbs: 0, fat: 5 },
  { name: "Light tuna", serving: "4 oz canned in water, drained", calories: 132, protein: 29, carbs: 0, fat: 1 },
  { name: "Pacific cod", serving: "4 oz cooked, dry heat", calories: 101, protein: 23, carbs: 0, fat: 1 },
  { name: "Tilapia", serving: "4 oz cooked, dry heat", calories: 145, protein: 30, carbs: 0, fat: 3 },
  { name: "Shrimp", serving: "4 oz cooked", calories: 112, protein: 24, carbs: 0, fat: 2 },
  { name: "Atlantic salmon", serving: "4 oz cooked, dry heat", calories: 234, protein: 25, carbs: 0, fat: 14 },
  { name: "Whole egg", serving: "1 large, hard-boiled", calories: 78, protein: 6, carbs: 1, fat: 5 },
  { name: "Egg whites", serving: "3 large, raw, fresh", calories: 51, protein: 11, carbs: 1, fat: 0 },
  { name: "Greek yogurt (nonfat)", serving: "1 cup, plain", calories: 130, protein: 23, carbs: 9, fat: 0 },
  { name: "Greek yogurt (2%)", serving: "1 cup, plain", calories: 170, protein: 20, carbs: 9, fat: 5 },
  { name: "Cottage cheese (2%)", serving: "1 cup, low-fat", calories: 183, protein: 24, carbs: 11, fat: 5 },
  { name: "Skim milk", serving: "1 cup, fluid", calories: 83, protein: 8, carbs: 12, fat: 0 },
  { name: "Whey isolate", serving: "1 scoop (30 g powder)", calories: 110, protein: 25, carbs: 1, fat: 0 },
  { name: "Firm tofu", serving: "4 oz, drained, raw", calories: 92, protein: 10, carbs: 2, fat: 6 },
  { name: "Tempeh", serving: "4 oz, cooked", calories: 221, protein: 22, carbs: 9, fat: 13 },
  // Reproducible plain seitan yield: 28.35 g FDC 168147 vital wheat gluten
  // plus 56.65 g water produces one 85 g (3 oz) serving. Water contributes no
  // macros; 370 kcal, 75.16 P, 13.79 C, and 1.85 F per 100 g dry scales and
  // rounds to the values below. Home recipes with broth/add-ins will differ.
  { name: "Seitan", serving: "3 oz cooked, from 1 oz dry gluten + water", calories: 105, protein: 21, carbs: 4, fat: 1 },
  { name: "Lentils", serving: "1 cup cooked, boiled, unsalted", calories: 230, protein: 18, carbs: 40, fat: 1 },
  { name: "Black beans", serving: "1 cup cooked, boiled, unsalted", calories: 227, protein: 15, carbs: 41, fat: 1 },
  { name: "Edamame", serving: "1 cup cooked, shelled", calories: 188, protein: 18, carbs: 14, fat: 8 },
  { name: "Textured vegetable protein", serving: "1/2 cup dry (48 g)", calories: 157, protein: 24, carbs: 16, fat: 1 },
];

// USDA FoodData Central SR Legacy records: "Rice, white, long-grain,
// regular, enriched, cooked" (FDC 168878), "Rice, brown, medium-grain,
// cooked" (FDC 168875), "Oats" (FDC 173904), "Quinoa, cooked" (FDC
// 168917), "Potatoes, baked, flesh and skin" (FDC 170030), "Sweet potato,
// cooked, baked in skin" (FDC 168483), "Bread, whole-wheat, commercially
// prepared" (FDC 172688), "Bagels, plain, enriched" (FDC 175051), "Tortilla,
// corn, shelf stable" (FDC 2707823), "Pasta, cooked, enriched, without added
// salt" (FDC 169737), "Couscous, cooked" (FDC 169700),
// "Chickpeas, cooked, boiled, without salt" (FDC 173757), "Beans, black,
// cooked, boiled, without salt" (FDC 173735), "Bananas, raw" (FDC 173944),
// "Apples, raw, with skin" (FDC 171688), "Blueberries, raw" (FDC 171711),
// "Corn, sweet, yellow, cooked, boiled, drained" (FDC 169999), "Peas,
// green, frozen, cooked, boiled, drained, with salt" (FDC 170105), and "Cereals
// ready-to-eat, wheat, puffed, fortified" (FDC 173913).
export const carbFoods: MacroFood[] = [
  { name: "White rice", serving: "1 cup cooked, long-grain", calories: 205, protein: 4, carbs: 45, fat: 0 },
  { name: "Brown rice", serving: "1 cup cooked, medium-grain", calories: 218, protein: 5, carbs: 46, fat: 2 },
  { name: "Oats", serving: "1/2 cup dry, rolled", calories: 152, protein: 5, carbs: 27, fat: 3 },
  { name: "Quinoa", serving: "1 cup cooked", calories: 222, protein: 8, carbs: 39, fat: 4 },
  { name: "White potato", serving: "1 medium baked, flesh and skin", calories: 161, protein: 4, carbs: 37, fat: 0 },
  { name: "Sweet potato", serving: "1 medium baked in skin", calories: 103, protein: 2, carbs: 24, fat: 0 },
  { name: "Whole-wheat bread", serving: "1 slice, commercially prepared", calories: 81, protein: 4, carbs: 14, fat: 1 },
  { name: "Plain bagel", serving: "1 medium, enriched", calories: 277, protein: 11, carbs: 55, fat: 2 },
  { name: "Corn tortilla", serving: "2 small (about 52 g), warmed", calories: 114, protein: 3, carbs: 24, fat: 2 },
  { name: "Pasta", serving: "1 cup cooked, enriched, unsalted", calories: 221, protein: 8, carbs: 43, fat: 1 },
  { name: "Couscous", serving: "1 cup cooked", calories: 176, protein: 6, carbs: 36, fat: 0 },
  { name: "Chickpeas", serving: "1 cup cooked, boiled, unsalted", calories: 269, protein: 15, carbs: 45, fat: 4 },
  { name: "Black beans", serving: "1 cup cooked, boiled, unsalted", calories: 227, protein: 15, carbs: 41, fat: 1 },
  { name: "Banana", serving: "1 medium, raw", calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: "Apple", serving: "1 medium, raw, with skin", calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: "Blueberries", serving: "1 cup, raw", calories: 84, protein: 1, carbs: 21, fat: 0 },
  { name: "Sweet corn", serving: "1 cup cooked, boiled, drained", calories: 143, protein: 5, carbs: 31, fat: 2 },
  { name: "Green peas", serving: "1 cup frozen, cooked, boiled, drained", calories: 124, protein: 8, carbs: 23, fat: 0 },
  { name: "Puffed wheat cereal", serving: "1 cup, ready-to-eat", calories: 55, protein: 2, carbs: 12, fat: 0 },
];

// USDA FoodData Central SR Legacy records: "Oil, olive, salad or cooking"
// (FDC 171413), "Butter, salted" (FDC 173410), "Avocados, raw, all
// commercial varieties" (FDC 171705), "Nuts, almonds" (FDC 170567),
// "Nuts, walnuts, English" (FDC 170187), "Peanuts, all types, raw" (FDC
// 172430), "Peanut butter, smooth style, without salt"
// (FDC 172470), "Seeds, chia seeds, dried" (FDC 170554), "Seeds, flaxseed"
// (FDC 169414), "Seeds, sesame butter, tahini, roasted" (FDC 170189), "Salad
// dressing, mayonnaise, regular" (FDC 171009), "Cheese, cheddar" (FDC
// 173414), and "Chocolate, dark, 70-85% cacao solids" (FDC 170273).
export const fatFoods: MacroFood[] = [
  { name: "Olive oil", serving: "1 tbsp, measured", calories: 119, protein: 0, carbs: 0, fat: 14 },
  { name: "Butter", serving: "1 tbsp, salted", calories: 102, protein: 0, carbs: 0, fat: 12 },
  { name: "Avocado", serving: "1/2 medium, raw", calories: 120, protein: 2, carbs: 6, fat: 11 },
  { name: "Almonds", serving: "1 oz (about 23), raw", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: "Walnuts", serving: "1 oz, raw", calories: 185, protein: 4, carbs: 4, fat: 19 },
  { name: "Peanuts", serving: "1 oz, raw", calories: 161, protein: 7, carbs: 5, fat: 14 },
  { name: "Peanut butter", serving: "2 tbsp, smooth, unsalted", calories: 191, protein: 7, carbs: 7, fat: 16 },
  { name: "Chia seeds", serving: "2 tbsp (28 g), dried", calories: 138, protein: 5, carbs: 12, fat: 9 },
  { name: "Flaxseed", serving: "2 tbsp (20 g), ground", calories: 107, protein: 4, carbs: 6, fat: 8 },
  { name: "Tahini", serving: "1 tbsp, sesame paste", calories: 89, protein: 3, carbs: 3, fat: 8 },
  { name: "Mayonnaise", serving: "1 tbsp, regular", calories: 94, protein: 0, carbs: 0, fat: 10 },
  { name: "Cheddar", serving: "1 oz", calories: 114, protein: 7, carbs: 1, fat: 9 },
  { name: "Dark chocolate", serving: "1 oz, 70-85% cacao", calories: 170, protein: 2, carbs: 13, fat: 12 },
];

// Explicit FDC-backed records keep this required order independent of the
// protein and fat reference arrays.
export const mixedFoods: MacroFood[] = [
  { name: "Whole eggs", serving: "1 large, hard-boiled", calories: 78, protein: 6, carbs: 1, fat: 5 },
  { name: "Salmon", serving: "4 oz Atlantic, cooked, dry heat", calories: 234, protein: 25, carbs: 0, fat: 14 },
  { name: "Tofu", serving: "4 oz firm, drained, raw", calories: 92, protein: 10, carbs: 2, fat: 6 },
  { name: "Tempeh", serving: "4 oz, cooked", calories: 221, protein: 22, carbs: 9, fat: 13 },
  { name: "Lentils", serving: "1 cup cooked, boiled, unsalted", calories: 230, protein: 18, carbs: 40, fat: 1 },
  { name: "Black beans", serving: "1 cup cooked, boiled, unsalted", calories: 227, protein: 15, carbs: 41, fat: 1 },
  { name: "Greek yogurt", serving: "1 cup, plain, 2% fat", calories: 170, protein: 20, carbs: 9, fat: 5 },
  { name: "Cottage cheese", serving: "1 cup, low-fat, 2% milkfat", calories: 183, protein: 24, carbs: 11, fat: 5 },
  { name: "Almonds", serving: "1 oz (about 23), raw", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: "Peanut butter", serving: "2 tbsp, smooth, unsalted", calories: 191, protein: 7, carbs: 7, fat: 16 },
  { name: "Chia seeds", serving: "2 tbsp (28 g), dried", calories: 138, protein: 5, carbs: 12, fat: 9 },
  { name: "Edamame", serving: "1 cup cooked, shelled", calories: 188, protein: 18, carbs: 14, fat: 8 },
];

const greekYogurtBreakfastItems: MealItem[] = [
  { name: "1 cup nonfat Greek yogurt", macros: { calories: 130, protein: 23, carbs: 9, fat: 0 } },
  { name: "1/2 cup dry rolled oats", macros: { calories: 152, protein: 5, carbs: 27, fat: 3 } },
  { name: "1 cup blueberries", macros: { calories: 84, protein: 1, carbs: 21, fat: 0 } },
  { name: "1 tbsp chia seeds", macros: { calories: 69, protein: 2, carbs: 6, fat: 4 } },
];

const chickenRiceItems: MealItem[] = [
  { name: "4 oz roasted chicken breast", macros: { calories: 187, protein: 35, carbs: 0, fat: 4 } },
  { name: "1 cup cooked white rice", macros: { calories: 205, protein: 4, carbs: 45, fat: 0 } },
  { name: "1 cup steamed broccoli", macros: { calories: 55, protein: 4, carbs: 11, fat: 1 } },
  { name: "1 tsp olive oil", macros: { calories: 40, protein: 0, carbs: 0, fat: 5 } },
];

const cottageCheeseSnackItems: MealItem[] = [
  { name: "1 cup 2% cottage cheese", macros: { calories: 183, protein: 24, carbs: 11, fat: 5 } },
  { name: "1 medium apple", macros: { calories: 95, protein: 0, carbs: 25, fat: 0 } },
  { name: "1 tbsp peanut butter", macros: { calories: 96, protein: 4, carbs: 4, fat: 8 } },
];

export const mealExamples: MealExample[] = [
  {
    name: "Greek-yogurt breakfast",
    items: greekYogurtBreakfastItems,
    total: sumMacros(greekYogurtBreakfastItems.map((item) => item.macros)),
  },
  {
    name: "Chicken-rice lunch / dinner",
    items: chickenRiceItems,
    total: sumMacros(chickenRiceItems.map((item) => item.macros)),
  },
  {
    name: "Cottage-cheese snack",
    items: cottageCheeseSnackItems,
    total: sumMacros(cottageCheeseSnackItems.map((item) => item.macros)),
  },
];

export const logDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
