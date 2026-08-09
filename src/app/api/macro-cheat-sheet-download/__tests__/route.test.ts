import type { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/macro-cheat-sheet-download/route";

const mocks = vi.hoisted(() => ({
  contactGet: vi.fn(),
  contactCreate: vi.fn(),
  emailSend: vi.fn(),
  renderPdf: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return {
      contacts: { get: mocks.contactGet, create: mocks.contactCreate },
      emails: { send: mocks.emailSend },
    };
  }),
}));

vi.mock("@/lib/macro-cheat-sheet/MacroCheatSheetDocument", () => ({
  MACRO_CHEAT_SHEET_PDF_FILENAME: "caloriecue-macro-tracking-cheat-sheet.pdf",
  renderMacroCheatSheetPdf: mocks.renderPdf,
}));

const originalApiKey = process.env.RESEND_API_KEY;
const EXPECTED_CONTACT_RESOLUTION_TIMEOUT_MS = 1_000;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function request(email = "Reader@Example.com", headers = new Headers()) {
  return {
    json: vi.fn().mockResolvedValue({ email }),
    headers,
    nextUrl: new URL("https://caloriecue.app/api/macro-cheat-sheet-download"),
  } as unknown as NextRequest;
}

describe("POST /api/macro-cheat-sheet-download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    mocks.renderPdf.mockResolvedValue(Buffer.from("macro-pdf"));
    mocks.emailSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
  });

  it("returns 400 for an invalid email", async () => {
    const response = await POST(request("not-an-email"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Please enter a valid email address",
    });
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("returns 500 when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Email service not configured",
    });
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("returns leadCreated true for a new contact and sends the macro PDF", async () => {
    mocks.contactGet.mockResolvedValue({
      data: null,
      error: { name: "not_found", message: "Not found", statusCode: 404 },
    });
    mocks.contactCreate.mockResolvedValue({
      data: { id: "contact-1", object: "contact" },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadCreated: true });
    expect(mocks.contactGet).toHaveBeenCalledWith({
      email: "reader@example.com",
      audienceId: "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912",
    });
    expect(mocks.contactCreate).toHaveBeenCalledWith({
      email: "reader@example.com",
      audienceId: "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912",
    });
    expect(mocks.emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "CalorieCue <hello@track.caloriecue.app>",
        to: "reader@example.com",
        subject: "Your Macro Tracking Cheat Sheet (PDF inside)",
        attachments: [
          expect.objectContaining({
            filename: "caloriecue-macro-tracking-cheat-sheet.pdf",
          }),
        ],
      }),
    );
  });

  it("returns leadCreated false for an existing contact", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadCreated: false });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "returns an error",
      () =>
        mocks.contactCreate.mockResolvedValue({
          data: null,
          error: {
            name: "validation_error",
            message: "Contact exists",
            statusCode: 400,
          },
        }),
    ],
    [
      "rejects",
      () => mocks.contactCreate.mockRejectedValue(new Error("Creation rejected")),
    ],
  ])("still sends and returns leadCreated false when contact creation %s", async (_case, setResult) => {
    mocks.contactGet.mockResolvedValue({
      data: null,
      error: { name: "not_found", message: "Not found", statusCode: 404 },
    });
    setResult();

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadCreated: false });
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("times out an unresolved contact lookup after 1,000 ms and still sends", async () => {
    vi.useFakeTimers();
    mocks.contactGet.mockReturnValue(new Promise(() => {}));

    const responsePromise = POST(request());
    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.emailSend).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(EXPECTED_CONTACT_RESOLUTION_TIMEOUT_MS);
    const response = await responsePromise;

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadCreated: false });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
  });

  it("begins email delivery before contact resolution finishes", async () => {
    const contactLookup = deferred<{
      data: { id: string; email: string };
      error: null;
    }>();
    mocks.contactGet.mockReturnValue(contactLookup.promise);

    const responsePromise = POST(request());

    await vi.waitFor(() => expect(mocks.contactGet).toHaveBeenCalledTimes(1));
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);

    contactLookup.resolve({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    const response = await responsePromise;

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadCreated: false });
  });

  it("sends a link-only email when PDF rendering fails", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    mocks.renderPdf.mockRejectedValue(new Error("Render failed"));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadCreated: false });
    expect(mocks.emailSend).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(
          "https://caloriecue.app/api/macro-cheat-sheet/pdf",
        ),
        text: expect.stringContaining(
          "https://caloriecue.app/api/macro-cheat-sheet/pdf",
        ),
      }),
    );
    expect(mocks.emailSend.mock.calls[0][0]).not.toHaveProperty("attachments");
  });

  it("returns 500 when Resend delivery fails and never claims success", async () => {
    mocks.contactGet.mockResolvedValue({
      data: null,
      error: { name: "not_found", message: "Not found", statusCode: 404 },
    });
    mocks.contactCreate.mockResolvedValue({
      data: { id: "contact-1", object: "contact" },
      error: null,
    });
    mocks.emailSend.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: "Send failed", statusCode: 500 },
    });

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to send email. Please try again.",
    });
  });

  it("uses forwarded host and protocol for the preview download URL", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    const headers = new Headers({
      "x-forwarded-host": "macro-preview.vercel.app",
      "x-forwarded-proto": "https",
    });

    const response = await POST(request("Reader@Example.com", headers));

    expect(response.status).toBe(200);
    const payload = mocks.emailSend.mock.calls[0][0];
    expect(payload.html).toContain(
      "https://macro-preview.vercel.app/api/macro-cheat-sheet/pdf",
    );
    expect(payload.text).toContain(
      "https://macro-preview.vercel.app/api/macro-cheat-sheet/pdf",
    );
  });
});
