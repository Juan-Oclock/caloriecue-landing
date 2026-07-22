import { describe, expect, it } from "vitest";
import {
  PROTEIN_EFFICIENCY_FOODS,
  caloriesPer10gProtein,
  filterFoods,
  proteinPer100Calories,
  sameCaloriesProtein,
  sameProteinCalories,
  serializeProteinFoodsCsv,
  sortFoods,
  validateProteinEfficiencyFoods,
  type ProteinEfficiencyFood,
} from "@/lib/blog/protein-efficiency";

const peanutButter = (): ProteinEfficiencyFood => ({
  id: "peanut-butter",
  name: "Peanut butter, smooth",
  category: "snack",
  serving: "2 tbsp (32 g)",
  calories: 188,
  proteinGrams: 8,
  swapTargetId: "greek-yogurt-nonfat",
  sourceLabel: "USDA FoodData Central — Peanut butter, creamy",
  sourceUrl: "https://fdc.nal.usda.gov/food-search/?query=peanut+butter+creamy",
});

const greekYogurt = (): ProteinEfficiencyFood => ({
  id: "greek-yogurt-nonfat",
  name: "Greek yogurt, plain, nonfat",
  category: "dairy",
  serving: "170 g single-serve cup",
  calories: 100,
  proteinGrams: 17.3,
  swapTargetId: "cottage-cheese-lowfat",
  sourceLabel: "USDA FoodData Central — Greek yogurt, plain, nonfat",
  sourceUrl: "https://fdc.nal.usda.gov/food-search/?query=greek+yogurt+plain+nonfat",
});

describe("protein efficiency calculations", () => {
  it("calculates protein per 100 calories", () => {
    expect(proteinPer100Calories(peanutButter())).toBeCloseTo(4.255, 3);
  });

  it("calculates calories per 10 grams of protein", () => {
    expect(caloriesPer10gProtein(peanutButter())).toBeCloseTo(235, 3);
  });

  it("returns null Protein Cost for a zero-protein food", () => {
    expect(caloriesPer10gProtein({ ...peanutButter(), proteinGrams: 0 })).toBeNull();
  });

  it("compares two foods at the selected food's calories", () => {
    expect(sameCaloriesProtein(peanutButter(), greekYogurt())).toBeCloseTo(32.524, 3);
  });

  it("compares calories needed to match the selected food's protein", () => {
    expect(sameProteinCalories(peanutButter(), greekYogurt())).toBeCloseTo(46.243, 3);
  });

  it("never returns a user-facing non-finite value", () => {
    const zeroProtein = { ...greekYogurt(), proteinGrams: 0 };
    expect(caloriesPer10gProtein(zeroProtein)).toBeNull();
    expect(sameProteinCalories(peanutButter(), zeroProtein)).toBeNull();
    expect(() => proteinPer100Calories({ ...peanutButter(), calories: 0 })).toThrow(RangeError);
  });
});

describe("canonical dataset", () => {
  it("contains exactly 30 valid records and resolvable swap targets", () => {
    expect(PROTEIN_EFFICIENCY_FOODS).toHaveLength(30);
    expect(validateProteinEfficiencyFoods(PROTEIN_EFFICIENCY_FOODS)).toEqual([]);
    expect(new Set(PROTEIN_EFFICIENCY_FOODS.map((food) => food.id)).size).toBe(30);
  });

  it("keeps the reconciled cream-cheese serving protein value", () => {
    const creamCheese = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "cream-cheese");
    expect(creamCheese?.proteinGrams).toBeCloseTo(1.6791, 4);
  });

  it("keeps the reconciled hummus serving and USDA description", () => {
    const hummus = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "hummus");
    expect(hummus?.calories).toBeCloseTo(106.2, 4);
    expect(hummus?.proteinGrams).toBeCloseTo(2.916, 4);
    expect(hummus?.sourceLabel).toBe("USDA FoodData Central — Hummus, home prepared");
  });

  it("keeps the reconciled potato-chip protein and exact USDA description", () => {
    const potatoChips = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "potato-chips");
    expect(potatoChips?.proteinGrams).toBeCloseTo(1.7892, 4);
    expect(potatoChips?.sourceLabel).toBe(
      "USDA FoodData Central — Snacks, potato chips, plain, salted",
    );
  });

  it("keeps the material tortilla-chip and bacon serving corrections", () => {
    const tortillaChips = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "tortilla-chips");
    const bacon = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "bacon");
    expect(tortillaChips?.proteinGrams).toBeCloseTo(1.988, 4);
    expect(tortillaChips?.sourceLabel).toBe(
      "USDA FoodData Central — Snacks, tortilla chips, plain, white corn, salted",
    );
    expect(bacon?.calories).toBeCloseTo(112.32, 4);
    expect(bacon?.proteinGrams).toBeCloseTo(8.136, 4);
    expect(bacon?.sourceLabel).toBe(
      "USDA FoodData Central — Pork, cured, bacon, pre-sliced, cooked, pan-fried",
    );
  });

  it("keeps the material Pacific-cod correction and exact final USDA sources", () => {
    const chicken = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "chicken-breast");
    const turkey = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "turkey-breast");
    const tuna = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "tuna-water");
    const cod = PROTEIN_EFFICIENCY_FOODS.find((food) => food.id === "cod-cooked");
    expect(chicken?.sourceLabel).toBe(
      "USDA FoodData Central — Chicken, broilers or fryers, breast, meat only, cooked, roasted",
    );
    expect(turkey?.sourceLabel).toBe(
      "USDA FoodData Central — Turkey, whole, breast, meat only, cooked, roasted",
    );
    expect(tuna?.sourceLabel).toBe(
      "USDA FoodData Central — Fish, tuna, light, canned in water, without salt, drained solids",
    );
    expect(cod?.calories).toBe(85);
    expect(cod?.proteinGrams).toBeCloseTo(18.7, 4);
    expect(cod?.sourceLabel).toBe(
      "USDA FoodData Central — Fish, cod, Pacific, cooked, dry heat (may contain additives to retain moisture)",
    );
  });

  it("keeps every source on USDA FoodData Central HTTPS search", () => {
    for (const food of PROTEIN_EFFICIENCY_FOODS) {
      expect(food.sourceLabel).toMatch(/^USDA FoodData Central — /);
      expect(food.sourceUrl).toMatch(/^https:\/\/fdc\.nal\.usda\.gov\/food-search\/\?query=/);
    }
  });

  it("filters by category without mutating the canonical array", () => {
    const originalIds = PROTEIN_EFFICIENCY_FOODS.map((food) => food.id);
    const dairy = filterFoods(PROTEIN_EFFICIENCY_FOODS, "dairy");
    expect(dairy.length).toBeGreaterThan(0);
    expect(dairy.every((food) => food.category === "dairy")).toBe(true);
    expect(PROTEIN_EFFICIENCY_FOODS.map((food) => food.id)).toEqual(originalIds);
  });

  it("sorts by Protein Cost with zero-protein values last", () => {
    const zeroProtein = { ...peanutButter(), id: "zero", proteinGrams: 0 };
    const sorted = sortFoods([greekYogurt(), zeroProtein, peanutButter()], "proteinCost", "desc");
    expect(sorted.map((food) => food.id)).toEqual([
      "peanut-butter",
      "greek-yogurt-nonfat",
      "zero",
    ]);
  });

  it("serializes the same dataset with escaped CSV cells", () => {
    const csv = serializeProteinFoodsCsv([
      { ...peanutButter(), name: 'Peanut butter, "smooth"' },
    ]);
    expect(csv).toContain('"Peanut butter, ""smooth"""');
    expect(csv.split("\n")).toHaveLength(2);
    expect(csv).toContain("Protein Cost (calories per 10 g protein)");
  });

  it("serializes all 30 canonical records with the expected header and reconciled examples", () => {
    const csv = serializeProteinFoodsCsv(PROTEIN_EFFICIENCY_FOODS);
    const rows = csv.split("\n");

    expect(rows).toHaveLength(31);
    expect(rows[0]).toBe('"Food","Category","Serving","Calories","Protein (g)","Protein per 100 calories (g)","Protein Cost (calories per 10 g protein)","USDA source"');
    expect(rows).toContain('"Plain granola","breakfast","1/2 cup (50 g)","235","6.85","2.9","343","https://fdc.nal.usda.gov/food-search/?query=cereals+ready-to-eat+granola+homemade"');
    expect(rows).toContain('"Cheddar cheese","dairy","1 oz (28 g)","113","6.524","5.8","173","https://fdc.nal.usda.gov/food-search/?query=cheese+cheddar"');
    expect(rows).toContain('"Pacific cod, cooked","convenience","100 g","85","18.7","22.0","45","https://fdc.nal.usda.gov/food-search/?query=fish+cod+Pacific+cooked+dry+heat"');
  });
});
