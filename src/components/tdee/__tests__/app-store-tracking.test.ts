import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CTA_FILES = [
  "src/components/tdee/MealPlanCard.tsx",
  "src/components/tdee/results/AppBridge.tsx",
  "src/components/tdee/results/ImmediateActionCTA.tsx",
  "src/components/tdee/results/MealPlanSection.tsx",
  "src/components/tdee/results/UrgencyClose.tsx",
];

describe("TDEE App Store measurement", () => {
  it.each(CTA_FILES)("tracks App Store links in %s as calculator intent", (file) => {
    const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    expect(source).toContain("TrackedAppStoreLink");
    expect(source).toMatch(/location=["{]calculator/);
  });
});
