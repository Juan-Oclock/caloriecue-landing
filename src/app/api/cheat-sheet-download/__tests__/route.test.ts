import type { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cheat-sheet-download/route";

const mocks = vi.hoisted(() => ({
  contactGet: vi.fn(),
  contactCreate: vi.fn(),
  emailSend: vi.fn(),
  renderPdf: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return {
      contacts: {
        get: mocks.contactGet,
        create: mocks.contactCreate,
      },
      emails: { send: mocks.emailSend },
    };
  }),
}));

vi.mock("@/lib/cheat-sheet/CheatSheetDocument", () => ({
  CHEAT_SHEET_PDF_FILENAME: "caloriecue-cheat-sheet.pdf",
  renderCheatSheetPdf: mocks.renderPdf,
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

function request(email = "Reader@Example.com") {
  return {
    json: vi.fn().mockResolvedValue({ email }),
    headers: new Headers(),
    nextUrl: new URL("https://caloriecue.app/api/cheat-sheet-download"),
  } as unknown as NextRequest;
}

describe("POST /api/cheat-sheet-download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    mocks.renderPdf.mockResolvedValue(Buffer.from("pdf"));
    mocks.emailSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
  });

  it("reports a newly created contact independently from email delivery", async () => {
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
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: true,
    });
    expect(mocks.contactGet).toHaveBeenCalledWith({
      email: "reader@example.com",
      audienceId: "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912",
    });
    expect(mocks.contactCreate).toHaveBeenCalledTimes(1);
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("reports an existing contact as delivery success without a new lead", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("starts email delivery before deferred contact resolution completes", async () => {
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
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
  });

  it("bounds unresolved contact lookup and returns conservative success", async () => {
    vi.useFakeTimers();
    mocks.contactGet.mockReturnValue(new Promise(() => {}));

    const responsePromise = POST(request());
    await vi.advanceTimersByTimeAsync(0);

    expect(mocks.emailSend).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(EXPECTED_CONTACT_RESOLUTION_TIMEOUT_MS);
    const response = await responsePromise;

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
  });

  it("still sends the PDF but does not claim a lead when contact creation fails", async () => {
    mocks.contactGet.mockResolvedValue({
      data: null,
      error: { name: "not_found", message: "Not found", statusCode: 404 },
    });
    mocks.contactCreate.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Contact exists", statusCode: 400 },
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("still sends the PDF but does not claim a lead when contact lookup returns an error", async () => {
    mocks.contactGet.mockResolvedValue({
      data: null,
      error: {
        name: "application_error",
        message: "Lookup failed",
        statusCode: 500,
      },
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("still sends the PDF but does not claim a lead when contact lookup rejects", async () => {
    mocks.contactGet.mockRejectedValue(new Error("Lookup rejected"));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("still sends the PDF but does not claim a lead when contact creation rejects", async () => {
    mocks.contactGet.mockResolvedValue({
      data: null,
      error: { name: "not_found", message: "Not found", statusCode: 404 },
    });
    mocks.contactCreate.mockRejectedValue(new Error("Creation rejected"));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
    });
    expect(mocks.contactCreate).toHaveBeenCalledTimes(1);
    expect(mocks.emailSend).toHaveBeenCalledTimes(1);
  });

  it("returns an error when email delivery fails and never reports a lead", async () => {
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
});
