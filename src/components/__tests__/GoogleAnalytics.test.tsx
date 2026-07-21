import { useEffect, type ComponentProps } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { trackGenerateLead } from "@/lib/analytics";

type MockScriptProps = ComponentProps<"script"> & {
  strategy?: string;
  onReady?: () => void;
};

const navigation = vi.hoisted(() => ({ pathname: "/" }));
const scriptControl = vi.hoisted(() => ({
  autoReady: true,
  onReady: undefined as (() => void) | undefined,
}));
const gtag = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/script", () => ({
  default: ({ strategy, onReady, ...props }: MockScriptProps) => {
    useEffect(() => {
      if (scriptControl.autoReady) onReady?.();
      else if (onReady) scriptControl.onReady = onReady;
    }, [onReady]);

    return <script data-strategy={strategy} {...props} />;
  },
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/";
    scriptControl.autoReady = true;
    scriptControl.onReady = undefined;
    window.history.replaceState({}, "", "/");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "",
    });
    Object.defineProperty(window, "gtag", {
      configurable: true,
      value: gtag,
      writable: true,
    });
    Reflect.deleteProperty(window, "dataLayer");
    Reflect.deleteProperty(window, "__calorieCueAnalyticsContext");
  });

  afterEach(() => {
    Reflect.deleteProperty(window, "gtag");
    Reflect.deleteProperty(window, "dataLayer");
    Reflect.deleteProperty(window, "__calorieCueAnalyticsContext");
  });

  it("loads both GA scripts after hydration instead of waiting for idle", () => {
    const { container } = render(<GoogleAnalytics />);
    const scripts = Array.from(container.querySelectorAll("script"));
    const loader = scripts[0];
    const inlineConfig = scripts[1];

    expect(scripts).toHaveLength(2);
    expect(scripts.every((script) => script.dataset.strategy === "afterInteractive"))
      .toBe(true);
    expect(loader).toHaveAttribute(
      "src",
      "https://www.googletagmanager.com/gtag/js?id=G-4E4N33E19T",
    );
    expect(inlineConfig.textContent).toContain(
      "gtag('config', 'G-4E4N33E19T'",
    );
    expect(inlineConfig.textContent).toContain("send_page_view: false");
    const globalContextIndex = inlineConfig.textContent.indexOf(
      "gtag('set', safePageContext)",
    );
    const configIndex = inlineConfig.textContent.indexOf(
      "gtag('config', 'G-4E4N33E19T'",
    );
    expect(globalContextIndex).toBeGreaterThanOrEqual(0);
    expect(configIndex).toBeGreaterThan(globalContextIndex);
    expect(inlineConfig.textContent).toContain(
      "page_location: safePageContext.page_location",
    );
    expect(inlineConfig.textContent).toContain(
      "page_referrer: safePageContext.page_referrer",
    );
  });

  it("bootstraps sanitized global and config context before any event", () => {
    window.history.replaceState(
      {},
      "",
      "/auth/callback?email=person%40example.com&token=secret-token&token_hash=secret-hash&code=oauth-code#private-fragment",
    );
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value:
        "https://referrer.example/source?email=ref%40example.com&token=ref-token#ref-fragment",
    });

    const { container } = render(<GoogleAnalytics />);
    const inlineConfig = container.querySelector("#google-analytics");
    if (!inlineConfig?.textContent) {
      throw new Error("Inline GA config script not found");
    }

    const executeBootstrap = new Function(
      "window",
      "document",
      "URL",
      inlineConfig.textContent,
    );
    executeBootstrap(window, document, URL);

    const dataLayer = (
      window as typeof window & { dataLayer: Array<ArrayLike<unknown>> }
    ).dataLayer;
    const calls = dataLayer.map((args) => Array.from(args));
    const safeContext = {
      page_location: `${window.location.origin}/auth/callback`,
      page_referrer: "https://referrer.example/source",
    };
    expect(calls[0][0]).toBe("js");
    expect(calls.slice(1)).toEqual([
      ["set", safeContext],
      [
        "config",
        "G-4E4N33E19T",
        { ...safeContext, send_page_view: false },
      ],
    ]);
    expect(
      (
        window as typeof window & {
          __calorieCueAnalyticsContext?: typeof safeContext;
        }
      ).__calorieCueAnalyticsContext,
    ).toEqual(safeContext);
    expect(calls.some(([command]) => command === "event")).toBe(false);
    const serializedCalls = JSON.stringify(calls);
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

  it("uses the bootstrapped page as referrer when navigation precedes readiness", async () => {
    const firstLocation = `${window.location.origin}/auth/callback`;
    const externalReferrer = "https://referrer.example/source";
    scriptControl.autoReady = false;
    navigation.pathname = "/auth/callback";
    window.history.replaceState(
      {},
      "",
      "/auth/callback?token=first-secret#first-fragment",
    );
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: `${externalReferrer}?code=external-secret#external-fragment`,
    });

    const { rerender } = render(<GoogleAnalytics />);
    Object.defineProperty(window, "__calorieCueAnalyticsContext", {
      configurable: true,
      value: {
        page_location: firstLocation,
        page_referrer: externalReferrer,
      },
      writable: true,
    });

    navigation.pathname = "/welcome";
    window.history.replaceState(
      {},
      "",
      "/welcome?email=person%40example.com#second-fragment",
    );
    rerender(<GoogleAnalytics />);
    act(() => scriptControl.onReady?.());

    const expectedContext = {
      page_location: `${window.location.origin}/welcome`,
      page_referrer: firstLocation,
    };
    await waitFor(() => expect(gtag).toHaveBeenCalledTimes(3));
    expect(gtag.mock.calls).toEqual([
      ["set", expectedContext],
      [
        "config",
        "G-4E4N33E19T",
        { ...expectedContext, send_page_view: false },
      ],
      [
        "event",
        "page_view",
        { ...expectedContext, page_path: "/welcome" },
      ],
    ]);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("first-secret");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("person@example.com");
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("external-secret");
  });

  it("sets sanitized context before page views and advances the virtual referrer", async () => {
    const sensitiveValues = [
      "person@example.com",
      "secret-token",
      "hash-secret",
      "oauth-code",
      "callback-fragment",
      "ref@example.com",
      "ref-token",
      "ref-hash",
      "ref-code",
      "ref-fragment",
    ];
    navigation.pathname = "/auth/callback";
    window.history.replaceState(
      {},
      "",
      "/auth/callback?email=person%40example.com&token=secret-token&token_hash=hash-secret&code=oauth-code#callback-fragment",
    );
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value:
        "https://referrer.example/previous?email=ref%40example.com&token=ref-token&token_hash=ref-hash&code=ref-code#ref-fragment",
    });

    const { container, rerender } = render(<GoogleAnalytics />);
    const inlineConfig = container.querySelector("#google-analytics");
    if (!inlineConfig) throw new Error("Inline GA config script not found");

    const initialContext = {
      page_location: `${window.location.origin}/auth/callback`,
      page_referrer: "https://referrer.example/previous",
    };
    await waitFor(() => expect(gtag).toHaveBeenCalledTimes(3));
    expect(gtag.mock.calls.slice(0, 3)).toEqual([
      ["set", initialContext],
      [
        "config",
        "G-4E4N33E19T",
        { ...initialContext, send_page_view: false },
      ],
      [
        "event",
        "page_view",
        { ...initialContext, page_path: "/auth/callback" },
      ],
    ]);

    const serializedInitialCalls = JSON.stringify(gtag.mock.calls.slice(0, 3));
    for (const value of sensitiveValues) {
      expect(serializedInitialCalls).not.toContain(value);
    }
    expect(initialContext.page_location).not.toContain("?");
    expect(initialContext.page_location).not.toContain("#");
    expect(initialContext.page_referrer).not.toContain("?");
    expect(initialContext.page_referrer).not.toContain("#");

    navigation.pathname = "/welcome";
    window.history.replaceState(
      {},
      "",
      "/welcome?token=next-secret#next-fragment",
    );
    rerender(<GoogleAnalytics />);

    const nextContext = {
      page_location: `${window.location.origin}/welcome`,
      page_referrer: `${window.location.origin}/auth/callback`,
    };
    await waitFor(() => expect(gtag).toHaveBeenCalledTimes(6));
    expect(gtag.mock.calls.slice(3, 6)).toEqual([
      ["set", nextContext],
      [
        "config",
        "G-4E4N33E19T",
        { ...nextContext, send_page_view: false },
      ],
      ["event", "page_view", { ...nextContext, page_path: "/welcome" }],
    ]);
    expect(nextContext.page_referrer).not.toBe(
      "https://referrer.example/previous",
    );
    expect(JSON.stringify(gtag.mock.calls.slice(3, 6))).not.toContain(
      "next-secret",
    );
    expect(JSON.stringify(gtag.mock.calls.slice(3, 6))).not.toContain(
      "next-fragment",
    );

    trackGenerateLead({
      leadType: "newsletter",
      location: "blog_footer",
      contentSlug: "welcome",
    });

    expect(gtag.mock.calls.slice(6, 9)).toEqual([
      ["set", nextContext],
      [
        "config",
        "G-4E4N33E19T",
        { ...nextContext, send_page_view: false },
      ],
      [
        "event",
        "generate_lead",
        {
          lead_type: "newsletter",
          location: "blog_footer",
          content_slug: "welcome",
        },
      ],
    ]);
  });
});
