import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "",
    });
    Reflect.deleteProperty(window, "gtag");
    Reflect.deleteProperty(window, "__calorieCueAnalyticsContext");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "",
    });
    Reflect.deleteProperty(window, "gtag");
    Reflect.deleteProperty(window, "__calorieCueAnalyticsContext");
  });

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

  it("emits a distinct macro cheat sheet lead", () => {
    const { track, adapter } = stubAdapter();

    trackGenerateLead(
      {
        leadType: "macro_cheat_sheet",
        location: "cheat_sheet_form",
        contentSlug: "macro-tracking-cheat-sheet",
      },
      adapter,
    );

    expect(track).toHaveBeenCalledWith("generate_lead", {
      lead_type: "macro_cheat_sheet",
      location: "cheat_sheet_form",
      content_slug: "macro-tracking-cheat-sheet",
    });
  });

  it("sets sanitized page context before a browser lead event", () => {
    const gtag = vi.fn();
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtag,
      writable: true,
    });
    window.history.replaceState(
      {},
      "",
      "/unsubscribe?email=person%40example.com&token=secret-token&token_hash=secret-hash&code=oauth-code#private-fragment",
    );
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value:
        "https://referrer.example/source?email=ref%40example.com&token=ref-token#ref-fragment",
    });

    trackGenerateLead({
      leadType: "newsletter",
      location: "blog_footer",
      contentSlug: "privacy-safe-analytics",
    });

    const safeContext = {
      page_location: `${window.location.origin}/unsubscribe`,
      page_referrer: "https://referrer.example/source",
    };
    expect(gtag.mock.calls).toEqual([
      ["set", safeContext],
      [
        "config",
        "G-4E4N33E19T",
        { ...safeContext, send_page_view: false },
      ],
      [
        "event",
        "generate_lead",
        {
          lead_type: "newsletter",
          location: "blog_footer",
          content_slug: "privacy-safe-analytics",
        },
      ],
    ]);
    expect(Object.keys(gtag.mock.calls[2][2]).sort()).toEqual([
      "content_slug",
      "lead_type",
      "location",
    ]);
    const serializedCalls = JSON.stringify(gtag.mock.calls);
    for (const secret of [
      "person@example.com",
      "secret-token",
      "secret-hash",
      "oauth-code",
      "private-fragment",
      "ref@example.com",
      "ref-token",
      "ref-fragment",
    ]) {
      expect(serializedCalls).not.toContain(secret);
    }
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
