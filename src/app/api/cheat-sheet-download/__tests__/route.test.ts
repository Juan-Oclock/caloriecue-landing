import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/cheat-sheet-download/route";

const mocks = vi.hoisted(() => ({
  contactGet: vi.fn(),
  contactCreate: vi.fn(),
  emailSend: vi.fn(),
  renderPdf: vi.fn(),
  rateLimit: vi.fn(),
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

vi.mock("@/lib/cheat-sheet/prebuilt-pdfs", () => ({
  CHEAT_SHEET_PDF_FILENAME: "caloriecue-cheat-sheet.pdf",
  readCheatSheetPdf: mocks.renderPdf,
}));

vi.mock("@/lib/macro-cheat-sheet/rate-limit", () => ({
  checkMacroCheatSheetRateLimit: mocks.rateLimit,
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

function request(email: unknown = "Reader@Example.com", headers = new Headers({ "x-forwarded-for": "203.0.113.9" })) {
  return new NextRequest("https://caloriecue.app/api/cheat-sheet-download", {
    method: "POST", headers, body: JSON.stringify({ email }),
  });
}

describe("POST /api/cheat-sheet-download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
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

  it("rejects rate-limited submissions before reading PDFs or contacting Resend", async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 731 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("731");
    expect(mocks.rateLimit).toHaveBeenCalledWith({ normalizedEmail: "reader@example.com", ipAddress: "203.0.113.9", namespace: "calorie-cheat-sheet" });
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
    expect(mocks.contactGet).not.toHaveBeenCalled();
  });

  it("fails closed if the shared rate-limit service is unavailable", async () => {
    mocks.rateLimit.mockRejectedValue(new Error("offline"));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("does not allow submissions without a trustworthy client IP", async () => {
    expect((await POST(request("reader@example.com", new Headers()))).status).toBe(503);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it.each([null, {}, [], 123, "bad-email"])("rejects invalid email %j", async (email) => {
    expect((await POST(request(email))).status).toBe(400);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
  });

  it("bounds request bodies before performing expensive work", async () => {
    const req = new NextRequest("https://caloriecue.app/api/cheat-sheet-download", {
      method: "POST", body: JSON.stringify({ email: "reader@example.com", extra: "x".repeat(4096) }),
    });
    expect((await POST(req)).status).toBe(413);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
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
