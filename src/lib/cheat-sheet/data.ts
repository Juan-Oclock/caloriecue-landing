/**
 * Single source of truth for the Calorie Counting Cheat Sheet content.
 *
 * Consumed by both the generated PDF (`CheatSheetDocument.tsx`) and the legacy
 * web print page (`/cheat-sheet/print`) so the two never drift. Calorie and
 * protein figures are rounded quick-reference estimates — close enough for the
 * ±100 cal accuracy that real-world tracking calls for.
 */

export interface CalorieTarget {
  weight: string;
  lose: string;
  maintain: string;
  gain: string;
}

export interface HandPortion {
  hand: string;
  serving: string;
  examples: string;
}

export interface FoodItem {
  name: string;
  serving: string;
  /** kcal — string to allow ranges like "200–250" */
  calories: string;
  /** grams of protein, where it's a meaningful figure */
  protein?: string;
}

export interface FoodCategory {
  title: string;
  items: FoodItem[];
}

export interface HighProteinFood {
  name: string;
  serving: string;
  protein: string;
  calories: string;
}

export interface SmartSwap {
  instead: string;
  swap: string;
  saves: string;
}

export interface RestaurantItem {
  name: string;
  calories: string;
}

export interface RestaurantCategory {
  title: string;
  items: RestaurantItem[];
}

export interface PortionTrap {
  food: string;
  serving: string;
  typical: string;
}

export interface TrackingRule {
  title: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Page 1 — Quick Start
// ---------------------------------------------------------------------------

export const calorieTargets: CalorieTarget[] = [
  { weight: "120 lbs", lose: "1,200–1,400", maintain: "1,600–1,800", gain: "1,900–2,100" },
  { weight: "140 lbs", lose: "1,300–1,500", maintain: "1,700–1,900", gain: "2,000–2,200" },
  { weight: "160 lbs", lose: "1,400–1,600", maintain: "1,900–2,100", gain: "2,200–2,400" },
  { weight: "180 lbs", lose: "1,500–1,800", maintain: "2,100–2,300", gain: "2,400–2,600" },
  { weight: "200 lbs", lose: "1,600–1,900", maintain: "2,300–2,500", gain: "2,600–2,800" },
  { weight: "220+ lbs", lose: "1,800–2,100", maintain: "2,500–2,700", gain: "2,800–3,000" },
];

export const handMethod: HandPortion[] = [
  { hand: "Palm", serving: "1 protein serving (~150–200 cal)", examples: "Chicken, fish, tofu" },
  { hand: "Fist", serving: "1 carb serving (~150–200 cal)", examples: "Rice, pasta, potatoes" },
  { hand: "Thumb", serving: "1 fat serving (~100–120 cal)", examples: "Oil, butter, nut butter" },
  { hand: "Cupped hand", serving: "1 snack serving (~150 cal)", examples: "Nuts, dried fruit, chips" },
  { hand: "Two fists", serving: "1 veggie serving (~50 cal)", examples: "Salad, broccoli, greens" },
];

export const trackingRules: TrackingRule[] = [
  { title: "Track as you eat", detail: "Logging hours later means guessing — and memory underestimates by ~half." },
  { title: "Use AI photo tracking", detail: "Snap a photo and move on. Less friction means you actually stick with it." },
  { title: "Track weekends too", detail: "Weekend overeating is where most calorie deficits quietly die." },
  { title: "Aim for ±100 cal, not perfection", detail: "Anything within 100 of your target is a successful day." },
  { title: "Track beverages", detail: "A latte, juice, and a beer can hide 400+ calories you forgot." },
  { title: "Meal prep your staples", detail: "Repeat 3–4 go-to meals, log them once, and reuse the entries." },
  { title: "Review weekly averages", detail: "One high day doesn't matter if the week balances out." },
];

export const portionTraps: PortionTrap[] = [
  { food: "Cooking oil", serving: "1 tbsp = 120", typical: "3 tbsp = 360" },
  { food: "Peanut butter", serving: "1 tbsp = 95", typical: "2–3 tbsp = 190–285" },
  { food: "Cooked rice", serving: "1 cup = 206", typical: "2–3 cups = 412–618" },
  { food: "Granola", serving: "⅓ cup = 140", typical: "1+ cup = 420+" },
  { food: "Salad dressing", serving: "2 tbsp = 140", typical: "4–6 tbsp = 280–420" },
  { food: "Cheese", serving: "1 oz = 110", typical: "2–3 oz = 220–330" },
];

// ---------------------------------------------------------------------------
// Page 2 — Common Foods Calorie Reference (~90 foods)
// ---------------------------------------------------------------------------

export const commonFoods: FoodCategory[] = [
  {
    title: "Proteins",
    items: [
      { name: "Chicken breast (grilled)", serving: "4 oz", calories: "185", protein: "35g" },
      { name: "Chicken thigh (skinless)", serving: "4 oz", calories: "235", protein: "28g" },
      { name: "Salmon fillet", serving: "4 oz", calories: "230", protein: "25g" },
      { name: "Tuna (canned in water)", serving: "4 oz", calories: "130", protein: "29g" },
      { name: "Shrimp", serving: "4 oz", calories: "120", protein: "23g" },
      { name: "Ground beef (90% lean)", serving: "4 oz", calories: "200", protein: "22g" },
      { name: "Ground turkey (93%)", serving: "4 oz", calories: "200", protein: "22g" },
      { name: "Sirloin steak", serving: "4 oz", calories: "230", protein: "33g" },
      { name: "Pork chop", serving: "4 oz", calories: "210", protein: "26g" },
      { name: "Eggs", serving: "2 large", calories: "140", protein: "12g" },
      { name: "Egg whites", serving: "3 large", calories: "50", protein: "11g" },
      { name: "Greek yogurt (nonfat)", serving: "1 cup", calories: "130", protein: "22g" },
      { name: "Cottage cheese (low-fat)", serving: "1 cup", calories: "180", protein: "24g" },
      { name: "Tofu (firm)", serving: "4 oz", calories: "95", protein: "10g" },
      { name: "Black beans", serving: "1 cup", calories: "220", protein: "15g" },
      { name: "Whey protein", serving: "1 scoop", calories: "120", protein: "25g" },
    ],
  },
  {
    title: "Grains & Carbs",
    items: [
      { name: "White rice (cooked)", serving: "1 cup", calories: "206" },
      { name: "Brown rice (cooked)", serving: "1 cup", calories: "215" },
      { name: "Pasta (cooked)", serving: "1 cup", calories: "220" },
      { name: "Quinoa (cooked)", serving: "1 cup", calories: "222" },
      { name: "Whole wheat bread", serving: "1 slice", calories: "80" },
      { name: "Bagel", serving: "1 medium", calories: "250" },
      { name: "Oatmeal (cooked)", serving: "1 cup", calories: "154" },
      { name: "Sweet potato", serving: "1 medium", calories: "103" },
      { name: "Baked potato", serving: "1 medium", calories: "160" },
      { name: "Corn tortilla", serving: "1", calories: "60" },
      { name: "Flour tortilla", serving: "1 medium", calories: "140" },
      { name: "Cereal (avg)", serving: "1 cup", calories: "150" },
    ],
  },
  {
    title: "Fats & Nuts",
    items: [
      { name: "Avocado", serving: "½ medium", calories: "120" },
      { name: "Olive oil", serving: "1 tbsp", calories: "120" },
      { name: "Butter", serving: "1 tbsp", calories: "100" },
      { name: "Almonds", serving: "1 oz (23)", calories: "164", protein: "6g" },
      { name: "Peanut butter", serving: "1 tbsp", calories: "95", protein: "4g" },
      { name: "Walnuts", serving: "1 oz", calories: "185" },
      { name: "Cheddar cheese", serving: "1 oz", calories: "113", protein: "7g" },
      { name: "Mozzarella", serving: "1 oz", calories: "85", protein: "6g" },
      { name: "Cream cheese", serving: "1 tbsp", calories: "50" },
      { name: "Mayonnaise", serving: "1 tbsp", calories: "90" },
      { name: "Chia seeds", serving: "1 tbsp", calories: "60" },
    ],
  },
  {
    title: "Fruits & Vegetables",
    items: [
      { name: "Banana", serving: "1 medium", calories: "105" },
      { name: "Apple", serving: "1 medium", calories: "95" },
      { name: "Orange", serving: "1 medium", calories: "62" },
      { name: "Strawberries", serving: "1 cup", calories: "50" },
      { name: "Blueberries", serving: "1 cup", calories: "85" },
      { name: "Grapes", serving: "1 cup", calories: "104" },
      { name: "Broccoli", serving: "1 cup", calories: "55" },
      { name: "Spinach (raw)", serving: "2 cups", calories: "15" },
      { name: "Mixed greens", serving: "2 cups", calories: "20" },
      { name: "Carrots", serving: "1 cup", calories: "50" },
      { name: "Bell pepper", serving: "1 medium", calories: "30" },
      { name: "Cucumber", serving: "1 cup", calories: "16" },
    ],
  },
  {
    title: "Drinks",
    items: [
      { name: "Black coffee", serving: "8 oz", calories: "2" },
      { name: "Latte (whole milk)", serving: "12 oz", calories: "180" },
      { name: "Orange juice", serving: "8 oz", calories: "110" },
      { name: "Whole milk", serving: "8 oz", calories: "150" },
      { name: "Skim milk", serving: "8 oz", calories: "90" },
      { name: "Almond milk (unsweet.)", serving: "8 oz", calories: "30" },
      { name: "Soda (cola)", serving: "12 oz", calories: "140" },
      { name: "Beer (regular)", serving: "12 oz", calories: "153" },
      { name: "Wine", serving: "5 oz", calories: "125" },
      { name: "Sweet tea", serving: "16 oz", calories: "180" },
    ],
  },
  {
    title: "Snacks & Treats",
    items: [
      { name: "Protein bar", serving: "1 bar", calories: "200–250", protein: "15–20g" },
      { name: "String cheese", serving: "1", calories: "80", protein: "7g" },
      { name: "Trail mix", serving: "¼ cup", calories: "175" },
      { name: "Tortilla chips", serving: "1 oz (10)", calories: "140" },
      { name: "Potato chips", serving: "1 oz", calories: "155" },
      { name: "Dark chocolate", serving: "1 oz", calories: "170" },
      { name: "Popcorn (air-popped)", serving: "3 cups", calories: "100" },
      { name: "Hummus", serving: "2 tbsp", calories: "70" },
      { name: "Rice cake", serving: "1", calories: "35" },
      { name: "Ice cream", serving: "½ cup", calories: "140" },
    ],
  },
  {
    title: "Condiments & Sauces",
    items: [
      { name: "Ketchup", serving: "1 tbsp", calories: "15" },
      { name: "Mustard", serving: "1 tbsp", calories: "10" },
      { name: "Soy sauce", serving: "1 tbsp", calories: "10" },
      { name: "BBQ sauce", serving: "1 tbsp", calories: "30" },
      { name: "Ranch dressing", serving: "2 tbsp", calories: "130" },
      { name: "Salsa", serving: "2 tbsp", calories: "10" },
      { name: "Honey", serving: "1 tbsp", calories: "64" },
      { name: "Maple syrup", serving: "1 tbsp", calories: "52" },
      { name: "Marinara sauce", serving: "½ cup", calories: "70" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Page 3 — High-Protein, Low-Calorie Foods & Smart Swaps
// ---------------------------------------------------------------------------

export const highProteinFoods: HighProteinFood[] = [
  { name: "Egg whites", serving: "3 large", protein: "11g", calories: "50" },
  { name: "Cod", serving: "4 oz", protein: "20g", calories: "90" },
  { name: "Shrimp", serving: "4 oz", protein: "23g", calories: "120" },
  { name: "Chicken breast", serving: "4 oz", protein: "35g", calories: "185" },
  { name: "Tuna (canned in water)", serving: "4 oz", protein: "29g", calories: "130" },
  { name: "Turkey breast (deli)", serving: "3 oz", protein: "18g", calories: "90" },
  { name: "Greek yogurt (nonfat)", serving: "1 cup", protein: "22g", calories: "130" },
  { name: "Cottage cheese (low-fat)", serving: "1 cup", protein: "24g", calories: "180" },
  { name: "Whey protein", serving: "1 scoop", protein: "25g", calories: "120" },
  { name: "Tofu (firm)", serving: "4 oz", protein: "10g", calories: "95" },
  { name: "Edamame", serving: "1 cup", protein: "18g", calories: "190" },
  { name: "Lentils (cooked)", serving: "1 cup", protein: "18g", calories: "230" },
];

export const smartSwaps: SmartSwap[] = [
  { instead: "Mayo on a sandwich", swap: "Mustard or mashed avocado", saves: "~80 cal" },
  { instead: "Sour cream (½ cup)", swap: "Plain Greek yogurt", saves: "~100 cal" },
  { instead: "Soda (12 oz)", swap: "Sparkling water", saves: "~140 cal" },
  { instead: "Whole-milk latte", swap: "Skim latte or Americano", saves: "~90–150 cal" },
  { instead: "3 tbsp oil to cook", swap: "1 tbsp oil + nonstick spray", saves: "~240 cal" },
  { instead: "White rice (1 cup)", swap: "Cauliflower rice", saves: "~180 cal" },
  { instead: "Tortilla chips", swap: "Air-popped popcorn", saves: "~50 cal + volume" },
  { instead: "Ground beef 80/20", swap: "Ground turkey 93%", saves: "~70 cal / 4 oz" },
  { instead: "Full bowl of pasta", swap: "Half pasta + zucchini noodles", saves: "~110 cal" },
  { instead: "Ranch dressing", swap: "Salsa or vinaigrette (1 tbsp)", saves: "~100 cal" },
  { instead: "Ice cream (1 cup)", swap: "Greek yogurt + berries", saves: "~150 cal" },
  { instead: "1 cup granola", swap: "⅓ cup granola + berries", saves: "~280 cal" },
];

// ---------------------------------------------------------------------------
// Page 4 — Restaurant & Fast-Food Guide
// ---------------------------------------------------------------------------

export const restaurantItems: RestaurantCategory[] = [
  {
    title: "Fast Food",
    items: [
      { name: "Cheeseburger (single)", calories: "300–350" },
      { name: "Double cheeseburger", calories: "450–520" },
      { name: "Crispy chicken sandwich", calories: "470–570" },
      { name: "Grilled chicken sandwich", calories: "350–420" },
      { name: "Medium fries", calories: "320–380" },
      { name: "6-pc chicken nuggets", calories: "250–280" },
      { name: "Burrito (loaded)", calories: "900–1,100" },
      { name: "Burrito bowl (rice, chicken, beans)", calories: "600–750" },
      { name: "Hard-shell beef taco", calories: "170–200" },
      { name: "Personal cheese pizza", calories: "600–800" },
    ],
  },
  {
    title: "Coffee Shop",
    items: [
      { name: "Flavored latte (medium)", calories: "250–350" },
      { name: "Blended coffee drink (medium)", calories: "350–500" },
      { name: "Blueberry muffin", calories: "380–450" },
      { name: "Bagel + cream cheese", calories: "450–500" },
    ],
  },
  {
    title: "Sit-Down Restaurant",
    items: [
      { name: "Caesar salad with chicken", calories: "600–900" },
      { name: "Pasta with cream sauce", calories: "1,000–1,400" },
      { name: "Cheeseburger + fries", calories: "1,100–1,500" },
      { name: "Grilled salmon + veg + starch", calories: "550–750" },
      { name: "8 oz steak + sides", calories: "800–1,100" },
      { name: "Fried appetizer (shared)", calories: "800–1,200" },
    ],
  },
];

export const restaurantTips: string[] = [
  "Check the calories before you go — most chains post them online.",
  "Order sauces and dressings on the side, then dip instead of drench.",
  "Swap fries for a side salad, fruit, or steamed veg.",
  "Pick grilled, baked, or steamed over fried, crispy, or creamy.",
  "Box half your entrée before you start eating.",
  "Split or skip liquid calories — soda, cocktails, and specialty coffees.",
];

// ---------------------------------------------------------------------------
// Page 5 — 7-Day Tracking Log
// ---------------------------------------------------------------------------

export const logWeekdays: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const logColumns: string[] = ["Day", "Breakfast", "Lunch", "Dinner", "Snacks", "Total", "Target"];

export const habitChecklist: string[] = [
  "Logged every meal",
  "Hit my protein target",
  "Stayed within ±100 cal",
  "Drank enough water",
  "Got 7+ hours of sleep",
  "Moved my body",
];
