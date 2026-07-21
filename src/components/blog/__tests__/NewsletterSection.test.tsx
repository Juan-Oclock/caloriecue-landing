import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
});
