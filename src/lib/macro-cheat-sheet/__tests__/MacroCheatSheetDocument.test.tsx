import { describe, expect, it } from "vitest";
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
  });
});

describe("MacroCheatSheetDocument", () => {
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
