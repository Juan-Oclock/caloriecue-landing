import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getPostBySlug } from "@/lib/blog";

const slug = "high-calorie-low-protein-foods";

describe("high-calorie low-protein interactive article", () => {
  it("publishes the approved metadata and interactive content", () => {
    const post = getPostBySlug(slug);
    expect(post).toBeDefined();
    expect(post?.title).toBe("High-Calorie, Low-Protein Foods: 30 Foods Ranked by Protein Cost (+ Swap Tool)");
    expect(post?.metaTitle).toBe("High-Calorie, Low-Protein Foods: 30 Ranked + Swap Tool");
    expect(post?.description).toContain("high-calorie, low-protein foods");
    expect(post?.coverImage).toBe("/blog/high-calorie-low-protein-foods.webp");
    expect(post?.coverImageAlt).toMatch(/equal-calorie/i);
    expect(post?.date).toBe("2026-07-22");
    expect(post?.dateModified).toBe("2026-07-22");
    expect(post?.tldr?.length).toBeGreaterThan(180);
    expect(post?.faq?.length).toBeGreaterThanOrEqual(7);
    expect(post?.content).toContain("<ProteinSwapExplorer />");
    expect(post?.content).not.toContain("<ProteinPerCalorieCalculator");
    expect(post?.content.trim().split(/\s+/).length).toBeGreaterThan(1400);
  });

  it("uses the required internal and authoritative external links", () => {
    const content = getPostBySlug(slug)?.content ?? "";
    for (const href of [
      "/blog/protein-per-calorie",
      "/blog/high-protein-low-calorie-foods",
      "/blog/how-much-protein-per-day-to-lose-weight",
      "/blog/calories-per-gram",
      "/tdee-calculator",
      "https://fdc.nal.usda.gov/",
      "https://pubmed.ncbi.nlm.nih.gov/25926512/",
      "https://www.kidney.org/kidney-topics/ckd-diet-how-much-protein-right-amount",
    ]) expect(content, href).toContain(href);
  });

  it("keeps visible FAQ questions and answers aligned with FAQ schema input", () => {
    const post = getPostBySlug(slug);
    for (const item of post?.faq ?? []) {
      expect(post?.content).toContain(`### ${item.question}`);
      expect(post?.content).toContain(item.answer);
    }
  });

  it("rounds comparison copy for readers while retaining the full-precision calculation note", () => {
    const content = getPostBySlug(slug)?.content ?? "";
    for (const figure of [
      "About 40.7 g protein",
      "About 40 cal for 6.9 g protein",
      "About 19.4 g protein",
      "About 38 cal for 6.5 g protein",
      "about 159 calories and 19.0 grams of protein",
      "saving about 76 calories and adding 12.2 grams of protein",
      "about 235 calories and 24.3 grams of protein",
      "saves 70 calories and adds 6.8 grams of protein",
      "save about 240 calories and add 14.9 grams of protein",
      "Calculations use the stored values at full precision and round only for display.",
    ]) expect(content, figure).toContain(figure);

    for (const overpreciseFigure of [
      "40.655",
      "6.524",
      "158.75",
      "19.0125",
      "76.25",
      "12.1625",
      "24.25",
      "6.75",
      "240.25",
      "14.9125",
    ]) expect(content).not.toContain(overpreciseFigure);
  });

  it("adds reciprocal links without retargeting adjacent pages", () => {
    const ratioPost = getPostBySlug("protein-per-calorie");
    const positivePost = getPostBySlug("high-protein-low-calorie-foods");
    expect(ratioPost?.content).toContain("/blog/high-calorie-low-protein-foods");
    expect(positivePost?.content).toContain("/blog/high-calorie-low-protein-foods");
    expect(ratioPost?.title).toBe("Protein Per Calorie Chart: Foods With the Best Ratio");
    expect(positivePost?.title).toBe("Foods High in Protein and Low in Calories: 40 Best Options Ranked");
  });

  it("has the generated cover asset in the public blog folder", () => {
    expect(fs.existsSync(path.join(process.cwd(), "public/blog/high-calorie-low-protein-foods.webp"))).toBe(true);
  });
});
