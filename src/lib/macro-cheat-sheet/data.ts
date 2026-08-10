export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type FoodDataType = "SR Legacy" | "Foundation" | "Survey (FNDDS)";

export type FoodSource = {
  fdcId: number;
  description: string;
  dataType: FoodDataType;
  servingGrams: number;
  per100g: MacroTotals;
  preparationState: string;
};

export type MacroFood = MacroTotals & {
  name: string;
  serving: string;
  source: FoodSource;
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

function macros(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
): MacroTotals {
  return { calories, protein, carbs, fat };
}

function sourcedFood(
  name: string,
  serving: string,
  source: FoodSource,
): MacroFood {
  const scale = source.servingGrams / 100;
  return {
    name,
    serving,
    calories: Math.round(source.per100g.calories * scale),
    protein: Math.round(source.per100g.protein * scale),
    carbs: Math.round(source.per100g.carbs * scale),
    fat: Math.round(source.per100g.fat * scale),
    source,
  };
}

function srFood(
  name: string,
  serving: string,
  fdcId: number,
  description: string,
  servingGrams: number,
  per100g: MacroTotals,
  preparationState: string,
): MacroFood {
  return sourcedFood(name, serving, {
    fdcId,
    description,
    dataType: "SR Legacy",
    servingGrams,
    per100g,
    preparationState,
  });
}

function republish(
  food: MacroFood,
  name: string,
  serving = food.serving,
): MacroFood {
  return { ...food, name, serving };
}

const chickenBreast = srFood("Chicken breast", "4 oz cooked, skinless, roasted", 171477, "Chicken, broilers or fryers, breast, meat only, cooked, roasted", 113.398, macros(165, 31, 0, 3.57), "cooked, roasted, meat only");
const turkeyBreast = srFood("Turkey breast", "4 oz cooked, skinless, roasted", 171496, "Turkey, whole, breast, meat only, cooked, roasted", 113.398, macros(147, 30.1, 0, 2.08), "cooked, roasted, meat only");
const groundTurkey = srFood("Ground turkey (93%)", "4 oz cooked, pan-broiled", 172851, "Turkey, ground, 93% lean, 7% fat, pan-broiled crumbles", 113.398, macros(213, 27.1, 0, 11.6), "93% lean, pan-broiled crumbles");
const groundBeef = srFood("Ground beef (90%)", "4 oz cooked, pan-browned", 171794, "Beef, ground, 90% lean meat / 10% fat, crumbles, cooked, pan-browned", 113.398, macros(230, 28.4, 0, 12), "90% lean, cooked, pan-browned");
const sirloin = srFood("Top sirloin", "4 oz cooked, broiled, lean only", 168635, "Beef, top sirloin, steak, separable lean only, trimmed to 0\" fat, choice, cooked, broiled", 113.398, macros(188, 30.3, 0, 6.55), "choice, cooked, broiled, lean only");
const porkTenderloin = srFood("Pork tenderloin", "4 oz cooked, roasted, lean only", 168250, "Pork, fresh, loin, tenderloin, separable lean only, cooked, roasted", 113.398, macros(143, 26.2, 0, 3.51), "cooked, roasted, lean only");
const tuna = sourcedFood("Light tuna", "4 oz canned in water, drained", { fdcId: 334194, description: "Fish, tuna, light, canned in water, drained solids", dataType: "Foundation", servingGrams: 113.398, per100g: macros(90, 19, 0.08, 0.94), preparationState: "canned in water, drained solids" });
const cod = srFood("Pacific cod", "4 oz cooked, dry heat", 171990, "Fish, cod, Pacific, cooked, dry heat (may contain additives to retain moisture)", 113.398, macros(85, 18.7, 0, 0.5), "cooked, dry heat");
const tilapia = srFood("Tilapia", "4 oz cooked, dry heat", 175177, "Fish, tilapia, cooked, dry heat", 113.398, macros(128, 26.2, 0, 2.65), "cooked, dry heat");
const shrimp = srFood("Shrimp", "4 oz cooked", 175180, "Crustaceans, shrimp, cooked", 113.398, macros(99, 24, 0.2, 0.28), "cooked");
const salmon = srFood("Atlantic salmon", "4 oz cooked, dry heat", 175168, "Fish, salmon, Atlantic, farmed, cooked, dry heat", 113.398, macros(206, 22.1, 0, 12.4), "farmed, cooked, dry heat");
const wholeEgg = srFood("Whole egg", "1 large, hard-boiled", 173424, "Egg, whole, cooked, hard-boiled", 50, macros(155, 12.6, 1.12, 10.6), "hard-boiled");
const eggWhites = srFood("Egg whites", "3 large, raw, fresh", 172183, "Egg, white, raw, fresh", 99, macros(52, 10.9, 0.73, 0.17), "raw, fresh");
const nonfatGreekYogurt = sourcedFood("Greek yogurt (nonfat)", "1 cup (227 g), plain", { fdcId: 330137, description: "Yogurt, Greek, plain, nonfat", dataType: "Foundation", servingGrams: 227, per100g: macros(61, 10.3, 3.64, 0.37), preparationState: "plain, nonfat" });
const lowfatGreekYogurt = srFood("Greek yogurt (2%)", "1 cup (227 g), plain", 170903, "Yogurt, Greek, plain, lowfat", 227, macros(73, 9.95, 3.94, 1.92), "plain, lowfat");
const cottageCheese = sourcedFood("Cottage cheese (2%)", "1 cup (220 g), low-fat", { fdcId: 328841, description: "Cheese, cottage, lowfat, 2% milkfat", dataType: "Foundation", servingGrams: 220, per100g: macros(84, 11, 4.31, 2.3), preparationState: "lowfat, 2% milkfat" });
const skimMilk = srFood("Skim milk", "1 cup, fluid", 171269, "Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim)", 245, macros(34, 3.37, 4.96, 0.08), "fluid, nonfat");
const whey = sourcedFood("Whey protein powder", "1 scoop (31 g powder)", { fdcId: 2710745, description: "Nutritional powder mix, protein, NFS", dataType: "Survey (FNDDS)", servingGrams: 31, per100g: macros(352, 78.1, 6.25, 1.56), preparationState: "dry powder, not further specified" });
const tofu = srFood("Firm tofu", "4 oz, drained, raw", 172475, "Tofu, raw, firm, prepared with calcium sulfate", 113.398, macros(144, 17.3, 2.78, 8.72), "raw, firm, drained");
const tempeh = srFood("Tempeh", "4 oz (USDA preparation unspecified)", 174272, "Tempeh", 113.398, macros(192, 20.3, 7.64, 10.8), "not specified by USDA");
const seitan = srFood("Seitan", "3 oz cooked, from 1 oz dry gluten + water", 168147, "Vital wheat gluten", 28.35, macros(370, 75.2, 13.8, 1.85), "28.35 g dry gluten combined with water; cooked yield 85 g");
const lentils = srFood("Lentils", "1 cup cooked, boiled, unsalted", 172421, "Lentils, mature seeds, cooked, boiled, without salt", 198, macros(116, 9.02, 20.1, 0.38), "cooked, boiled, without salt");
const blackBeans = srFood("Black beans", "1 cup cooked, boiled, unsalted", 173735, "Beans, black, mature seeds, cooked, boiled, without salt", 172, macros(132, 8.86, 23.7, 0.54), "cooked, boiled, without salt");
const edamame = srFood("Edamame", "1 cup cooked, shelled", 168411, "Edamame, frozen, prepared", 155, macros(121, 11.9, 8.91, 5.2), "frozen, prepared, shelled");
const tvp = sourcedFood("Textured vegetable protein", "1/2 cup dry (48 g)", { fdcId: 2707451, description: "Textured vegetable protein, dry", dataType: "Survey (FNDDS)", servingGrams: 48, per100g: macros(366, 51.1, 32.9, 3.33), preparationState: "dry" });

export const proteinFoods: MacroFood[] = [chickenBreast, turkeyBreast, groundTurkey, groundBeef, sirloin, porkTenderloin, tuna, cod, tilapia, shrimp, salmon, wholeEgg, eggWhites, nonfatGreekYogurt, lowfatGreekYogurt, cottageCheese, skimMilk, whey, tofu, tempeh, seitan, lentils, blackBeans, edamame, tvp];

const whiteRice = srFood("White rice", "1 cup cooked, long-grain", 168878, "Rice, white, long-grain, regular, enriched, cooked", 158, macros(130, 2.69, 28.2, 0.28), "cooked");
const brownRice = srFood("Brown rice", "1 cup cooked, medium-grain", 168875, "Rice, brown, medium-grain, cooked (Includes foods for USDA's Food Distribution Program)", 195, macros(112, 2.32, 23.5, 0.83), "cooked");
const oats = srFood("Oats", "1/2 cup dry (40 g), rolled", 173904, "Cereals, oats, regular and quick, not fortified, dry", 40, macros(379, 13.2, 67.7, 6.52), "dry");
const quinoa = srFood("Quinoa", "1 cup cooked", 168917, "Quinoa, cooked", 185, macros(120, 4.4, 21.3, 1.92), "cooked");
const potato = srFood("White potato", "1 medium (173 g), baked, flesh and skin", 170030, "Potatoes, Russet, flesh and skin, baked", 173, macros(95, 2.63, 21.4, 0.13), "baked, flesh and skin");
const sweetPotato = srFood("Sweet potato", "1 medium baked in skin", 168483, "Sweet potato, cooked, baked in skin, flesh, without salt", 114, macros(90, 2.01, 20.7, 0.15), "baked in skin, flesh, without salt");
const wheatBread = srFood("Whole-wheat bread", "1 slice (32 g), commercially prepared", 172688, "Bread, whole-wheat, commercially prepared", 32, macros(252, 12.4, 42.7, 3.5), "commercially prepared");
const bagel = srFood("Plain bagel", "1 medium (105 g), unenriched", 175051, "Bagels, plain, unenriched, without calcium propionate(includes onion, poppy, sesame)", 105, macros(275, 10.5, 53.4, 1.6), "plain, unenriched");
const tortilla = sourcedFood("Corn tortilla", "2 small (52 g)", { fdcId: 2707823, description: "Tortilla, corn", dataType: "Survey (FNDDS)", servingGrams: 52, per100g: macros(218, 5.7, 44.6, 2.85), preparationState: "as served; custom 52 g portion" });
const pasta = srFood("Pasta", "1 cup cooked (140 g), enriched, unsalted", 169737, "Pasta, cooked, enriched, without added salt", 140, macros(158, 5.8, 30.9, 0.93), "cooked, enriched, without added salt");
const couscous = srFood("Couscous", "1 cup cooked", 169700, "Couscous, cooked", 157, macros(112, 3.79, 23.2, 0.16), "cooked");
const chickpeas = srFood("Chickpeas", "1 cup cooked, boiled, unsalted", 173757, "Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt", 164, macros(164, 8.86, 27.4, 2.59), "cooked, boiled, without salt");
const banana = srFood("Banana", "1 medium, raw", 173944, "Bananas, raw", 118, macros(89, 1.09, 22.8, 0.33), "raw");
const apple = srFood("Apple", "1 medium, raw, with skin", 171688, "Apples, raw, with skin (Includes foods for USDA's Food Distribution Program)", 182, macros(52, 0.26, 13.8, 0.17), "raw, with skin");
const blueberries = srFood("Blueberries", "1 cup, raw", 171711, "Blueberries, raw", 148, macros(57, 0.74, 14.5, 0.33), "raw");
const corn = srFood("Sweet corn", "1 cup cooked, boiled, drained", 169999, "Corn, sweet, yellow, cooked, boiled, drained, without salt", 149, macros(96, 3.41, 21, 1.5), "cooked, boiled, drained, without salt");
const peas = srFood("Green peas", "1 cup (160 g), frozen, boiled, drained", 170105, "Peas, green, frozen, cooked, boiled, drained, with salt", 160, macros(78, 5.15, 14.3, 0.27), "frozen, cooked, boiled, drained, with salt");
const puffedWheat = srFood("Puffed wheat cereal", "1 cup (12 g), ready-to-eat", 173913, "Cereals ready-to-eat, wheat, puffed, fortified", 12, macros(364, 14.7, 79.6, 1.2), "ready-to-eat, fortified");

export const carbFoods: MacroFood[] = [whiteRice, brownRice, oats, quinoa, potato, sweetPotato, wheatBread, bagel, tortilla, pasta, couscous, chickpeas, republish(blackBeans, "Black beans"), banana, apple, blueberries, corn, peas, puffedWheat];

const oliveOil = srFood("Olive oil", "1 tbsp, measured", 171413, "Oil, olive, salad or cooking", 13.5, macros(884, 0, 0, 100), "salad or cooking oil");
const butter = srFood("Butter", "1 tbsp, salted", 173410, "Butter, salted", 14.2, macros(717, 0.85, 0.06, 81.1), "salted");
const avocado = srFood("Avocado", "1/2 avocado (about 101 g), raw", 171705, "Avocados, raw, all commercial varieties", 100.5, macros(160, 2, 8.53, 14.7), "raw; half of USDA 201 g whole portion");
const almonds = srFood("Almonds", "1 oz (about 23), raw", 170567, "Nuts, almonds", 28.35, macros(579, 21.2, 21.6, 49.9), "raw");
const walnuts = srFood("Walnuts", "1 oz, raw", 170187, "Nuts, walnuts, english", 28.35, macros(654, 15.2, 13.7, 65.2), "raw");
const peanuts = srFood("Peanuts", "1 oz, raw", 172430, "Peanuts, all types, raw", 28.35, macros(567, 25.8, 16.1, 49.2), "raw");
const peanutButter = srFood("Peanut butter", "2 tbsp, smooth, unsalted", 172470, "Peanut butter, smooth style, without salt", 32, macros(598, 22.2, 22.3, 51.4), "smooth, without salt");
const chia = srFood("Chia seeds", "2 tbsp (28 g), dried", 170554, "Seeds, chia seeds, dried", 28, macros(486, 16.5, 42.1, 30.7), "dried; custom 28 g portion");
const flax = srFood("Flaxseed", "2 tbsp (14 g), ground", 169414, "Seeds, flaxseed", 14, macros(534, 18.3, 28.9, 42.2), "ground; two USDA 7 g tablespoon portions");
const tahini = srFood("Tahini", "1 tbsp, roasted sesame paste", 170189, "Seeds, sesame butter, tahini, from roasted and toasted kernels (most common type)", 15, macros(595, 17, 21.2, 53.8), "roasted and toasted sesame paste");
const mayonnaise = srFood("Mayonnaise", "1 tbsp, regular", 171009, "Salad dressing, mayonnaise, regular", 13.8, macros(680, 0.96, 0.57, 74.8), "regular");
const cheddar = srFood("Cheddar", "1 oz", 173414, "Cheese, cheddar (Includes foods for USDA's Food Distribution Program)", 28.35, macros(403, 22.9, 3.37, 33.3), "cheddar cheese");
const darkChocolate = srFood("Dark chocolate", "1 oz, 70–85% cacao", 170273, "Chocolate, dark, 70-85% cacao solids", 28.35, macros(598, 7.79, 45.9, 42.6), "70–85% cacao solids");

export const fatFoods: MacroFood[] = [oliveOil, butter, avocado, almonds, walnuts, peanuts, peanutButter, chia, flax, tahini, mayonnaise, cheddar, darkChocolate];

export const mixedFoods: MacroFood[] = [
  republish(wholeEgg, "Whole eggs"),
  republish(salmon, "Salmon", "4 oz Atlantic, cooked, dry heat"),
  republish(tofu, "Tofu", "4 oz firm, drained, raw"),
  tempeh,
  lentils,
  blackBeans,
  republish(lowfatGreekYogurt, "Greek yogurt", "1 cup (227 g), plain, lowfat"),
  republish(cottageCheese, "Cottage cheese", "1 cup (220 g), low-fat, 2% milkfat"),
  almonds,
  peanutButter,
  chia,
  edamame,
];

const greekYogurtBreakfastItems: MealItem[] = [
  { name: "1 cup nonfat Greek yogurt", macros: macros(138, 23, 8, 1) },
  { name: "1/2 cup dry rolled oats", macros: macros(152, 5, 27, 3) },
  { name: "1 cup blueberries", macros: macros(84, 1, 21, 0) },
  { name: "1 tbsp chia seeds", macros: macros(68, 2, 6, 4) },
];

const chickenRiceItems: MealItem[] = [
  { name: "4 oz roasted chicken breast", macros: macros(187, 35, 0, 4) },
  { name: "1 cup cooked white rice", macros: macros(205, 4, 45, 0) },
  { name: "1 cup boiled broccoli, drained", macros: macros(55, 4, 11, 1) },
  { name: "1 tsp olive oil", macros: macros(40, 0, 0, 5) },
];

const cottageCheeseSnackItems: MealItem[] = [
  { name: "1 cup 2% cottage cheese", macros: macros(185, 24, 9, 5) },
  { name: "1 medium apple", macros: macros(95, 0, 25, 0) },
  { name: "1 tbsp peanut butter", macros: macros(96, 4, 4, 8) },
];

export const mealExamples: MealExample[] = [
  { name: "Greek-yogurt breakfast", items: greekYogurtBreakfastItems, total: sumMacros(greekYogurtBreakfastItems.map((item) => item.macros)) },
  { name: "Chicken-rice lunch / dinner", items: chickenRiceItems, total: sumMacros(chickenRiceItems.map((item) => item.macros)) },
  { name: "Cottage-cheese snack", items: cottageCheeseSnackItems, total: sumMacros(cottageCheeseSnackItems.map((item) => item.macros)) },
];

export const logDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
