import { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewsletterSection from "@/components/blog/NewsletterSection";
import { trackGenerateLead } from "@/lib/analytics";

const mocks = vi.hoisted(() => ({ insert: vi.fn() }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ insert: mocks.insert }),
  }),
}));

vi.mock("@/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics")>();
  return { ...actual, trackGenerateLead: vi.fn() };
});

async function submit(email: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Enter your email"), email);
  const form = screen.getByRole("button", { name: /subscribe/i }).closest("form");
  if (!form) throw new Error("Newsletter form not found");
  fireEvent.submit(form);
}

describe("NewsletterSection", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("tracks one lead after Supabase creates a new row", async () => {
    mocks.insert.mockResolvedValue({ error: null });
    render(<NewsletterSection contentSlug="protein-per-calorie" />);

    await submit("Reader@Example.com");

    await waitFor(() =>
      expect(screen.getByText(/you.re subscribed/i)).toBeInTheDocument(),
    );
    expect(mocks.insert).toHaveBeenCalledWith([
      { email: "reader@example.com" },
    ]);
    expect(trackGenerateLead).toHaveBeenCalledTimes(1);
    expect(trackGenerateLead).toHaveBeenCalledWith({
      leadType: "newsletter",
      location: "blog_footer",
      contentSlug: "protein-per-calorie",
    });
  });

  it("omits slug attribution for a successful listing-page submission", async () => {
    mocks.insert.mockResolvedValue({ error: null });
    render(<NewsletterSection />);

    await submit("reader@example.com");

    await waitFor(() =>
      expect(screen.getByText(/you.re subscribed/i)).toBeInTheDocument(),
    );
    expect(trackGenerateLead).toHaveBeenCalledTimes(1);
    expect(trackGenerateLead).toHaveBeenCalledWith({
      leadType: "newsletter",
      location: "blog_footer",
      contentSlug: undefined,
    });
  });

  it("does not track an invalid email", async () => {
    render(<NewsletterSection />);

    await submit("not-an-email");

    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it("does not track a duplicate newsletter address", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505" } });
    render(<NewsletterSection contentSlug="article" />);

    await submit("reader@example.com");

    await waitFor(() =>
      expect(screen.getByText("You're already subscribed!")).toBeInTheDocument(),
    );
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it("does not track a backend error", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "50000" } });
    render(<NewsletterSection contentSlug="article" />);

    await submit("reader@example.com");

    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument(),
    );
    expect(trackGenerateLead).not.toHaveBeenCalled();
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
