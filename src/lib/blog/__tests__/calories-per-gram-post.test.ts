import { describe, expect, it } from "vitest";
import { getPostBySlug } from "@/lib/blog";

describe("calories-per-gram blog draft", () => {
  it("matches the current CalorieCue TLDR and visual-rich post pattern", () => {
    const post = getPostBySlug("calories-per-gram");

    expect(post).toBeDefined();
    expect(post?.title).toBe(
      "Calories per Gram: Protein, Carbs, Fat and Alcohol (Chart + Calculator)",
    );
    expect(post?.coverImage).toBe("/blog/calories-per-gram.webp");
    expect(post?.coverImageAlt).toContain("protein, carbohydrates, fat, and alcohol");
    expect(post?.tldr).toContain("4-4-9-7");
    expect(post?.tldr?.length).toBeGreaterThan(180);
    expect(post?.faq?.length).toBeGreaterThanOrEqual(8);
    expect(post?.content).toContain("<CaloriesPerGramCalculator />");
    expect(post?.content).toContain("/blog/calories-per-gram-chart.svg");
    expect(post?.content).toContain("/blog/calories-per-gram-label-math.svg");
    expect(post?.content).toContain("/blog/calories-per-100-calories.svg");
    expect(post?.content.trim().split(/\s+/).length).toBeGreaterThan(1800);
  });
});
