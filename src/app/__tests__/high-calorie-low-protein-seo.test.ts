import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { generateMetadata } from "@/app/blog/[slug]/page";

const slug = "high-calorie-low-protein-foods";
const canonical = `https://caloriecue.app/blog/${slug}`;

describe("high-calorie low-protein article SEO", () => {
  it("uses the single clean self-canonical URL", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.title).toBe("High-Calorie, Low-Protein Foods: 30 Ranked + Swap Tool");
    expect(metadata.openGraph?.url).toBe(canonical);
    expect(metadata.robots).toBeUndefined();
  });

  it("includes the article in the sitemap exactly once", () => {
    const matches = sitemap().filter((entry) => entry.url === canonical);

    expect(matches).toHaveLength(1);
    expect(matches[0].lastModified?.toISOString()).toBe("2026-07-22T00:00:00.000Z");
  });
});
