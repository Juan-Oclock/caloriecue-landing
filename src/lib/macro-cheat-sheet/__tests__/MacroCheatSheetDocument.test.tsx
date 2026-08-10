import { afterEach, describe, expect, it, vi } from "vitest";
import {
  carbFoods,
  fatFoods,
  mealExamples,
  mixedFoods,
  proteinFoods,
  sumMacros,
} from "@/lib/macro-cheat-sheet/data";
import {
  MACRO_CHEAT_SHEET_PDF_FILENAME,
  renderMacroCheatSheetPdf,
} from "@/lib/macro-cheat-sheet/MacroCheatSheetDocument";
import {
  PdfRenderCircuitOpenError,
  PdfRenderTimeoutError,
  createPdfRenderCoordinator,
} from "@/lib/macro-cheat-sheet/pdf-render-coordinator";

const allPublishedFoods = [
  ...proteinFoods,
  ...carbFoods,
  ...fatFoods,
  ...mixedFoods,
];

function foodNamed(name: string) {
  const food = allPublishedFoods.find((candidate) => candidate.name === name);
  expect(food, `Missing food fixture: ${name}`).toBeDefined();
  return food!;
}

describe("macro cheat sheet data", () => {
  it("contains substantial, positive, preparation-specific food lists", () => {
    expect(proteinFoods.length).toBeGreaterThanOrEqual(24);
    expect(carbFoods.length).toBeGreaterThanOrEqual(18);
    expect(fatFoods.length).toBeGreaterThanOrEqual(12);
    expect(mixedFoods.length).toBeGreaterThanOrEqual(8);
    for (const food of [
      ...proteinFoods,
      ...carbFoods,
      ...fatFoods,
      ...mixedFoods,
    ]) {
      expect(food.name.trim()).not.toBe("");
      expect(food.serving.trim()).not.toBe("");
      expect(food.calories).toBeGreaterThan(0);
      expect(food.protein).toBeGreaterThanOrEqual(0);
      expect(food.carbs).toBeGreaterThanOrEqual(0);
      expect(food.fat).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps worked meal totals auditable", () => {
    for (const meal of mealExamples) {
      expect(sumMacros(meal.items.map((item) => item.macros))).toEqual(
        meal.total,
      );
    }

    expect(Object.fromEntries(mealExamples.map((meal) => [meal.name, meal.total])))
      .toEqual({
        "Greek-yogurt breakfast": {
          calories: 442,
          protein: 31,
          carbs: 62,
          fat: 8,
        },
        "Chicken-rice lunch / dinner": {
          calories: 487,
          protein: 43,
          carbs: 56,
          fat: 10,
        },
        "Cottage-cheese snack": {
          calories: 376,
          protein: 28,
          carbs: 38,
          fat: 13,
        },
      });
  });

  it("publishes reproducible FoodData Central source metadata for every row", () => {
    for (const food of allPublishedFoods) {
      expect(food.source.fdcId).toBeGreaterThan(0);
      expect(food.source.description.trim()).not.toBe("");
      expect(food.source.dataType).toMatch(
        /^(SR Legacy|Foundation|Survey \(FNDDS\))$/,
      );
      expect(food.source.servingGrams).toBeGreaterThan(0);
      expect(food.source.preparationState.trim()).not.toBe("");
      expect(food.source.per100g.calories).toBeGreaterThan(0);

      const scale = food.source.servingGrams / 100;
      expect({
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }).toEqual({
        calories: Math.round(food.source.per100g.calories * scale),
        protein: Math.round(food.source.per100g.protein * scale),
        carbs: Math.round(food.source.per100g.carbs * scale),
        fat: Math.round(food.source.per100g.fat * scale),
      });
    }
  });

  it("locks challenged USDA records to exact source-to-serving fixtures", () => {
    expect(foodNamed("Firm tofu")).toMatchObject({
      calories: 163,
      protein: 20,
      carbs: 3,
      fat: 10,
      source: {
        fdcId: 172475,
        description: "Tofu, raw, firm, prepared with calcium sulfate",
        dataType: "SR Legacy",
        servingGrams: 113.398,
        preparationState: "raw, firm, drained",
        per100g: { calories: 144, protein: 17.3, carbs: 2.78, fat: 8.72 },
      },
    });
    expect(foodNamed("Light tuna")).toMatchObject({
      calories: 102,
      protein: 22,
      carbs: 0,
      fat: 1,
      source: {
        fdcId: 334194,
        description: "Fish, tuna, light, canned in water, drained solids",
        dataType: "Foundation",
        servingGrams: 113.398,
        preparationState: "canned in water, drained solids",
        per100g: { calories: 90, protein: 19, carbs: 0.08, fat: 0.94 },
      },
    });
    expect(foodNamed("Textured vegetable protein")).toMatchObject({
      calories: 176,
      protein: 25,
      carbs: 16,
      fat: 2,
      source: {
        fdcId: 2707451,
        description: "Textured vegetable protein, dry",
        dataType: "Survey (FNDDS)",
        servingGrams: 48,
        preparationState: "dry",
        per100g: { calories: 366, protein: 51.1, carbs: 32.9, fat: 3.33 },
      },
    });
    expect(foodNamed("Tempeh")).toMatchObject({
      serving: "4 oz (USDA preparation unspecified)",
      calories: 218,
      protein: 23,
      carbs: 9,
      fat: 12,
      source: {
        fdcId: 174272,
        description: "Tempeh",
        dataType: "SR Legacy",
        servingGrams: 113.398,
        preparationState: "not specified by USDA",
        per100g: { calories: 192, protein: 20.3, carbs: 7.64, fat: 10.8 },
      },
    });
    expect(foodNamed("Whey protein powder")).toMatchObject({
      calories: 109,
      protein: 24,
      carbs: 2,
      fat: 0,
      source: {
        fdcId: 2710745,
        description: "Nutritional powder mix, protein, NFS",
        dataType: "Survey (FNDDS)",
        servingGrams: 31,
        preparationState: "dry powder, not further specified",
        per100g: { calories: 352, protein: 78.1, carbs: 6.25, fat: 1.56 },
      },
    });
  });

  it.each([
    ["Turkey breast", 167, 34, 0, 2],
    ["Ground turkey (93%)", 242, 31, 0, 13],
    ["Ground beef (90%)", 261, 32, 0, 14],
    ["Top sirloin", 213, 34, 0, 7],
    ["Pork tenderloin", 162, 30, 0, 4],
    ["Pacific cod", 96, 21, 0, 1],
    ["Shrimp", 112, 27, 0, 0],
    ["Greek yogurt (nonfat)", 138, 23, 8, 1],
    ["Greek yogurt (2%)", 166, 23, 9, 4],
    ["Cottage cheese (2%)", 185, 24, 9, 5],
    ["Whey protein powder", 109, 24, 2, 0],
    ["White potato", 164, 5, 37, 0],
    ["Plain bagel", 289, 11, 56, 2],
    ["Corn tortilla", 113, 3, 23, 1],
    ["Green peas", 125, 8, 23, 0],
    ["Puffed wheat cereal", 44, 2, 10, 0],
    ["Avocado", 161, 2, 9, 15],
    ["Walnuts", 185, 4, 4, 18],
    ["Chia seeds", 136, 5, 12, 9],
    ["Flaxseed", 75, 3, 4, 6],
    ["Cheddar", 114, 6, 1, 9],
  ])(
    "keeps the audited serving result for %s",
    (name, calories, protein, carbs, fat) => {
      expect(foodNamed(name)).toMatchObject({
        calories,
        protein,
        carbs,
        fat,
      });
    },
  );

  it("keeps the required mixed-food set in a stable order", () => {
    expect(mixedFoods.map((food) => food.name)).toEqual([
      "Whole eggs",
      "Salmon",
      "Tofu",
      "Tempeh",
      "Lentils",
      "Black beans",
      "Greek yogurt",
      "Cottage cheese",
      "Almonds",
      "Peanut butter",
      "Chia seeds",
      "Edamame",
    ]);
  });
});

describe("PDF render coordination", () => {
  afterEach(() => vi.useRealTimers());

  it("times out a hung shared render without starting parallel renders", async () => {
    vi.useFakeTimers();
    let resolveRender!: (buffer: Buffer) => void;
    const render = vi.fn(
      () =>
        new Promise<Buffer>((resolve) => {
          resolveRender = resolve;
        }),
    );
    const coordinator = createPdfRenderCoordinator({
      render,
      timeoutMs: 100,
      circuitCooldownMs: 1_000,
    });

    const first = coordinator.render();
    const second = coordinator.render();
    const firstTimedOut = expect(first).rejects.toBeInstanceOf(
      PdfRenderTimeoutError,
    );
    const secondTimedOut = expect(second).rejects.toBeInstanceOf(
      PdfRenderTimeoutError,
    );
    await vi.advanceTimersByTimeAsync(100);

    await Promise.all([firstTimedOut, secondTimedOut]);
    expect(render).toHaveBeenCalledTimes(1);
    await expect(coordinator.render()).rejects.toBeInstanceOf(
      PdfRenderCircuitOpenError,
    );

    await vi.advanceTimersByTimeAsync(1_000);
    const retry = coordinator.render();
    const retryTimedOut = expect(retry).rejects.toBeInstanceOf(
      PdfRenderTimeoutError,
    );
    await vi.advanceTimersByTimeAsync(100);
    await retryTimedOut;
    expect(render).toHaveBeenCalledTimes(1);

    const recoveredBuffer = Buffer.from("%PDF-recovered");
    resolveRender(recoveredBuffer);
    await vi.runAllTimersAsync();
    await expect(coordinator.render()).resolves.toBe(recoveredBuffer);
  });
});

describe("MacroCheatSheetDocument", () => {
  it(
    "deduplicates concurrent PDF renders",
    async () => {
      const [first, second] = await Promise.all([
        renderMacroCheatSheetPdf(),
        renderMacroCheatSheetPdf(),
      ]);

      expect(first).toBe(second);
    },
    20_000,
  );

  it(
    "renders a PDF buffer with the stable filename",
    async () => {
      const buffer = await renderMacroCheatSheetPdf();
      expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
      expect(buffer.length).toBeGreaterThan(20_000);
      expect(MACRO_CHEAT_SHEET_PDF_FILENAME).toBe(
        "caloriecue-macro-tracking-cheat-sheet.pdf",
      );
    },
    20_000,
  );
});
