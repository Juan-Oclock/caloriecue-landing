import { describe, expect, it, vi } from "vitest";
import {
  trackAppStoreClick,
  trackGenerateLead,
  type AnalyticsAdapter,
} from "@/lib/analytics";

function stubAdapter() {
  const track = vi.fn();
  const adapter: AnalyticsAdapter = { track };
  return { track, adapter };
}

describe("shared analytics", () => {
  it("emits generate_lead with only allow-listed newsletter fields", () => {
    const { track, adapter } = stubAdapter();

    trackGenerateLead(
      {
        leadType: "newsletter",
        location: "blog_footer",
        contentSlug: "protein-per-calorie",
      },
      adapter,
    );

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("generate_lead", {
      lead_type: "newsletter",
      location: "blog_footer",
      content_slug: "protein-per-calorie",
    });
    expect(Object.keys(track.mock.calls[0][1]).sort()).toEqual([
      "content_slug",
      "lead_type",
      "location",
    ]);
  });

  it("omits content_slug when no page slug is available", () => {
    const { track, adapter } = stubAdapter();

    trackGenerateLead(
      { leadType: "newsletter", location: "blog_footer" },
      adapter,
    );

    expect(track).toHaveBeenCalledWith("generate_lead", {
      lead_type: "newsletter",
      location: "blog_footer",
    });
  });

  it("emits app_store_click with the blog placement and slug", () => {
    const { track, adapter } = stubAdapter();

    trackAppStoreClick(
      { location: "blog_inline", contentSlug: "calories-in-food-list" },
      adapter,
    );

    expect(track).toHaveBeenCalledWith("app_store_click", {
      location: "blog_inline",
      content_slug: "calories-in-food-list",
    });
  });

  it("keeps existing non-blog App Store payloads stable", () => {
    const { track, adapter } = stubAdapter();

    trackAppStoreClick({ location: "pricing" }, adapter);

    expect(track).toHaveBeenCalledWith("app_store_click", {
      location: "pricing",
    });
  });

  it("swallows analytics adapter failures", () => {
    const adapter: AnalyticsAdapter = {
      track: () => {
        throw new Error("blocked analytics");
      },
    };

    expect(() =>
      trackGenerateLead(
        { leadType: "cheat_sheet", location: "cheat_sheet_form" },
        adapter,
      ),
    ).not.toThrow();
  });
});
