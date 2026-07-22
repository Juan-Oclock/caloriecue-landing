import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

import NewsletterSection from "@/components/blog/NewsletterSection";

describe("NewsletterSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hydrates without warning when a password manager annotates its controls", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<NewsletterSection />);

    const form = container.querySelector("form");
    const input = container.querySelector("input");
    const button = container.querySelector("button");

    expect(form).not.toBeNull();
    expect(input).not.toBeNull();
    expect(button).not.toBeNull();

    form?.setAttribute("data-dashlane-rid", "form-id");
    input?.setAttribute("data-dashlane-rid", "input-id");
    button?.setAttribute("data-dashlane-label", "true");
    button?.setAttribute("data-dashlane-rid", "button-id");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, <NewsletterSection />);
    });

    const loggedErrors = consoleError.mock.calls
      .flatMap((call) => call)
      .map(String)
      .join("\n");

    expect(loggedErrors).not.toContain(
      "hydrated but some attributes of the server rendered HTML didn't match",
    );

    await act(async () => {
      root?.unmount();
    });
  });
});
