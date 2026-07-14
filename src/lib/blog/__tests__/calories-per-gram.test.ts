import { describe, expect, it } from "vitest";
import { calculateMacroCalories } from "@/lib/blog/calories-per-gram";

describe("calculateMacroCalories", () => {
  it("applies the 4-4-9 rule to protein, carbs, and fat", () => {
    expect(
      calculateMacroCalories({ protein: 10, carbs: 24, fat: 7, alcohol: 0 }),
    ).toEqual({
      protein: 40,
      carbs: 96,
      fat: 63,
      alcohol: 0,
      total: 199,
    });
  });

  it("includes alcohol at seven calories per gram", () => {
    expect(
      calculateMacroCalories({ protein: 0, carbs: 0, fat: 0, alcohol: 14 }),
    ).toEqual({
      protein: 0,
      carbs: 0,
      fat: 0,
      alcohol: 98,
      total: 98,
    });
  });

  it("rejects negative or non-finite gram values", () => {
    expect(() =>
      calculateMacroCalories({ protein: -1, carbs: 0, fat: 0, alcohol: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateMacroCalories({ protein: 0, carbs: Number.NaN, fat: 0, alcohol: 0 }),
    ).toThrow(RangeError);
  });
});
