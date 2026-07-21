import { useEffect, type ComponentProps } from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GoogleAnalytics from "@/components/GoogleAnalytics";

type MockScriptProps = ComponentProps<"script"> & {
  strategy?: string;
  onReady?: () => void;
};

const navigation = vi.hoisted(() => ({ pathname: "/" }));
const gtag = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/script", () => ({
  default: ({ strategy, onReady, ...props }: MockScriptProps) => {
    useEffect(() => {
      onReady?.();
    }, [onReady]);

    return <script data-strategy={strategy} {...props} />;
  },
}));

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/";
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
  });

  afterEach(() => {
    Reflect.deleteProperty(window, "gtag");
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
  });

  it("emits sanitized page views on initial load and client navigation", async () => {
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

    await waitFor(() =>
      expect(gtag).toHaveBeenCalledWith("event", "page_view", {
        page_location: `${window.location.origin}/auth/callback`,
        page_path: "/auth/callback",
        page_referrer: "https://referrer.example/previous",
      }),
    );

    const initialPayload = gtag.mock.calls[0][2];
    const serializedInitialPayload = JSON.stringify(initialPayload);
    for (const value of sensitiveValues) {
      expect(serializedInitialPayload).not.toContain(value);
    }
    expect(initialPayload.page_location).not.toContain("?");
    expect(initialPayload.page_location).not.toContain("#");
    expect(initialPayload.page_referrer).not.toContain("?");
    expect(initialPayload.page_referrer).not.toContain("#");

    navigation.pathname = "/welcome";
    window.history.replaceState(
      {},
      "",
      "/welcome?token=next-secret#next-fragment",
    );
    rerender(<GoogleAnalytics />);

    await waitFor(() => expect(gtag).toHaveBeenCalledTimes(2));
    expect(gtag).toHaveBeenLastCalledWith("event", "page_view", {
      page_location: `${window.location.origin}/welcome`,
      page_path: "/welcome",
      page_referrer: "https://referrer.example/previous",
    });
    expect(JSON.stringify(gtag.mock.calls[1][2])).not.toContain("next-secret");
    expect(JSON.stringify(gtag.mock.calls[1][2])).not.toContain(
      "next-fragment",
    );
  });
});
