import { describe, expect, it } from "vitest";
import { mealBases, mealTotals, nutrients, portionFoods, proteinLabel, PORTION_SLUG } from "../data";
import { blogCampaignUrl } from "@/lib/blog/app-store-campaigns";

describe("30g protein portions", () => {
  it("keeps each practical portion near 30g without making 30g-food assumptions", () => {
    for (const food of portionFoods) {
      const result = nutrients(food.id, food.grams);
      expect(result.protein).toBeGreaterThanOrEqual(29);
      expect(result.protein).toBeLessThanOrEqual(32);
    }
    expect(nutrients("chicken", 30).protein).toBeCloseTo(9.3);
    expect(nutrients("eggs", 100)).toEqual({ protein: 12.6, calories: 155 });
  });
  it("adds mixed portions before rounding", () => {
    expect(mealTotals(mealBases[0]).protein).toBeCloseTo(30.45);
    expect(proteinLabel(mealTotals(mealBases[0]).protein)).toBe("30.5");
    expect(mealTotals(mealBases[1])).toEqual({ protein: 30.645, calories: 296 });
    for (const meal of mealBases) {
      expect(mealTotals(meal).protein).toBeGreaterThanOrEqual(29);
      expect(mealTotals(meal).protein).toBeLessThanOrEqual(32);
    }
  });
  it("keeps the article identifiable in Apple and website attribution", () => {
    const link = new URL(blogCampaignUrl(PORTION_SLUG, "product_example"));
    expect(link.searchParams.get("ct")).toBe("blog-30g-protein-v1");
    expect(link.searchParams.get("utm_content")).toBe(PORTION_SLUG);
    expect(link.pathname).toContain("6757112503");
  });
});
