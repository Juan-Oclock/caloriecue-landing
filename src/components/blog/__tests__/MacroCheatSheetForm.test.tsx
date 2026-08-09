import type { ComponentType } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MacroCheatSheetForm from "@/components/blog/MacroCheatSheetForm";
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
  if (!form) throw new Error("Macro cheat-sheet form not found");
  fireEvent.submit(form);
}

describe("MacroCheatSheetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("delivers the macro cheat sheet and tracks a newly created lead", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, leadCreated: true }),
    });
    const components = getMDXComponents("macro-tracking-cheat-sheet");
    const Form = components.MacroCheatSheetForm as ComponentType;
    render(<Form />);

    expect(screen.getByText(/macro tracking cheat sheet/i)).toBeInTheDocument();
    await submit("Reader@Example.com");

    await waitFor(() =>
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/macro-cheat-sheet-download",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "reader@example.com" }),
      }),
    );
    expect(trackGenerateLead).toHaveBeenCalledWith({
      leadType: "macro_cheat_sheet",
      location: "cheat_sheet_form",
      contentSlug: "macro-tracking-cheat-sheet",
    });
  });

  it("shows delivery success without tracking a repeat contact", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, leadCreated: false }),
    });
    render(<MacroCheatSheetForm contentSlug="macro-tracking-cheat-sheet" />);

    await submit("reader@example.com");

    await waitFor(() =>
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument(),
    );
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it("does not call the API or analytics for invalid input", async () => {
    render(<MacroCheatSheetForm contentSlug="article" />);

    await submit("not-an-email");

    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(trackGenerateLead).not.toHaveBeenCalled();
  });

  it("shows a backend delivery error without tracking", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to send email. Please try again." }),
    });
    render(<MacroCheatSheetForm contentSlug="article" />);

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
      render(<MacroCheatSheetForm contentSlug="macro-tracking-cheat-sheet" />);

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

  it("disables the form while delivery is pending", async () => {
    let resolveFetch: (value: unknown) => void;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    render(<MacroCheatSheetForm contentSlug="article" />);

    await submit("reader@example.com");

    expect(screen.getByRole("button", { name: "Sending..." })).toBeDisabled();
    expect(screen.getByPlaceholderText("Enter your email")).toBeDisabled();

    resolveFetch!({
      ok: true,
      json: async () => ({ success: true, leadCreated: false }),
    });
    await waitFor(() =>
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument(),
    );
  });
});
