import type { ComponentType } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheatSheetForm from "@/components/blog/CheatSheetForm";
import { getMDXComponents } from "@/components/blog/MDXComponents";
import { trackGenerateLead } from "@/lib/analytics";

const fetchMock = vi.fn();

vi.mock("@/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics")>();
  return { ...actual, trackGenerateLead: vi.fn() };
});

async function submit(email: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Enter your email"), email);
  const form = screen
    .getByRole("button", { name: "Send Me the PDF" })
    .closest("form");
  if (!form) throw new Error("Cheat-sheet form not found");
  fireEvent.submit(form);
}

describe("CheatSheetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("tracks one lead when delivery succeeds and a new contact was created", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, leadCreated: true }),
    });
    const components = getMDXComponents("calorie-counting-cheat-sheet");
    const FactoryCheatSheetForm = components.CheatSheetForm as ComponentType;
    render(<FactoryCheatSheetForm />);

    await submit("Reader@Example.com");

    await waitFor(() =>
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument(),
    );
    expect(trackGenerateLead).toHaveBeenCalledTimes(1);
    expect(trackGenerateLead).toHaveBeenCalledWith({
      leadType: "cheat_sheet",
      location: "cheat_sheet_form",
      contentSlug: "calorie-counting-cheat-sheet",
    });
  });

  it("shows delivery success but does not track a repeat contact", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, leadCreated: false }),
    });
    render(<CheatSheetForm contentSlug="calorie-counting-cheat-sheet" />);

    await submit("reader@example.com");

    await waitFor(() =>
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument(),
    );
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it("does not call the API or analytics for invalid input", async () => {
    render(<CheatSheetForm contentSlug="article" />);

    await submit("not-an-email");

    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it("does not track a failed backend request", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to send email. Please try again." }),
    });
    render(<CheatSheetForm contentSlug="article" />);

    await submit("reader@example.com");

    await waitFor(() =>
      expect(
        screen.getByText("Failed to send email. Please try again."),
      ).toBeInTheDocument(),
    );
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it.each([
    ["malformed", {}],
    ["non-success", { success: false, leadCreated: true }],
  ])(
    "does not track or show success for an HTTP-200 %s payload",
    async (_label, payload) => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => payload,
      });
      render(<CheatSheetForm contentSlug="calorie-counting-cheat-sheet" />);

      await submit("reader@example.com");

      await waitFor(() =>
        expect(
          screen.getByText("Something went wrong. Please try again."),
        ).toBeInTheDocument(),
      );
      expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
      expect(trackGenerateLead).not.toHaveBeenCalled();
    },
  );
});
