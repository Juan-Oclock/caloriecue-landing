import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/macro-cheat-sheet-download/route";

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
      contacts: { get: mocks.contactGet, create: mocks.contactCreate },
      emails: { send: mocks.emailSend },
    };
  }),
}));

vi.mock("@/lib/macro-cheat-sheet/MacroCheatSheetDocument", () => ({
  MACRO_CHEAT_SHEET_PDF_FILENAME: "caloriecue-macro-tracking-cheat-sheet.pdf",
  renderMacroCheatSheetPdf: mocks.renderPdf,
}));

vi.mock("@/lib/macro-cheat-sheet/rate-limit", () => ({
  checkMacroCheatSheetRateLimit: mocks.rateLimit,
}));

const originalApiKey = process.env.RESEND_API_KEY;
const originalVercelUrl = process.env.VERCEL_URL;
const originalVercelBranchUrl = process.env.VERCEL_BRANCH_URL;
const originalVercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const EXPECTED_CONTACT_RESOLUTION_TIMEOUT_MS = 1_000;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function request(
  email: unknown = "Reader@Example.com",
  headers = new Headers(),
  nextUrl = new URL("https://caloriecue.app/api/macro-cheat-sheet-download"),
) {
  return requestBody(JSON.stringify({ email }), headers, nextUrl);
}

function requestBody(
  body: string,
  headers = new Headers(),
  nextUrl = new URL("https://caloriecue.app/api/macro-cheat-sheet-download"),
) {
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("x-forwarded-for")) {
    requestHeaders.set("x-forwarded-for", "203.0.113.9");
  }
  requestHeaders.set("content-type", "application/json");
  return new NextRequest(nextUrl, {
    method: "POST",
    headers: requestHeaders,
    body,
  });
}

describe("POST /api/macro-cheat-sheet-download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_BRANCH_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    mocks.renderPdf.mockResolvedValue(Buffer.from("macro-pdf"));
    mocks.emailSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalVercelUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = originalVercelUrl;
    if (originalVercelBranchUrl === undefined) delete process.env.VERCEL_BRANCH_URL;
    else process.env.VERCEL_BRANCH_URL = originalVercelBranchUrl;
    if (originalVercelProductionUrl === undefined) {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    } else {
      process.env.VERCEL_PROJECT_PRODUCTION_URL = originalVercelProductionUrl;
    }
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

  it.each([null, 42, true, {}, [], ["reader@example.com"]])(
    "returns 400 when email has malformed type %#",
    async (email) => {
      const response = await POST(request(email));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Please enter a valid email address",
      });
      expect(mocks.renderPdf).not.toHaveBeenCalled();
      expect(mocks.emailSend).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["malformed JSON", "{"],
    ["top-level null", "null"],
    ["a string body", JSON.stringify("reader@example.com")],
    ["an array body", JSON.stringify(["reader@example.com"])],
  ])("returns 400 for %s without starting downstream work", async (_case, body) => {
    const response = await POST(requestBody(body));

    expect(response.status).toBe(400);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.contactGet).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies and email values before downstream work", async () => {
    const oversizedBody = await POST(
      requestBody(
        JSON.stringify({
          email: "reader@example.com",
          padding: "x".repeat(5_000),
        }),
      ),
    );
    const oversizedEmail = await POST(request(`${"a".repeat(245)}@example.com`));

    expect(oversizedBody.status).toBe(413);
    expect(oversizedEmail.status).toBe(400);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.contactGet).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("rejects a filled honeypot without rendering, contacts, or delivery", async () => {
    const response = await POST(
      requestBody(
        JSON.stringify({ email: "reader@example.com", website: "spam.example" }),
      ),
    );

    expect(response.status).toBe(400);
    expect(mocks.rateLimit).not.toHaveBeenCalled();
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.contactGet).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After when either distributed window is full", async () => {
    mocks.rateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 731,
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("731");
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.contactGet).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("fails closed with a retryable response when rate limiting is unavailable", async () => {
    mocks.rateLimit.mockRejectedValue(new Error("rate limit unavailable"));

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.json()).toEqual({
      error: "Download delivery is temporarily unavailable. Please try again.",
    });
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.contactGet).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("uses the first valid Vercel-forwarded IP and does not send raw identity downstream", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    const headers = new Headers({
      "x-vercel-forwarded-for": "unknown, 198.51.100.24, 198.51.100.25",
      "x-forwarded-for": "203.0.113.9",
    });

    const response = await POST(request("Reader@Example.com", headers));

    expect(response.status).toBe(200);
    expect(mocks.rateLimit).toHaveBeenCalledWith({
      normalizedEmail: "reader@example.com",
      ipAddress: "198.51.100.24",
    });
  });

  it("fails closed when no valid client IP is available", async () => {
    const noIpRequest = new NextRequest(
      "https://caloriecue.app/api/macro-cheat-sheet-download",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "reader@example.com" }),
      },
    );

    const response = await POST(noIpRequest);

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(mocks.rateLimit).not.toHaveBeenCalled();
    expect(mocks.renderPdf).not.toHaveBeenCalled();
    expect(mocks.emailSend).not.toHaveBeenCalled();
  });

  it("trims surrounding whitespace before validating and normalizing email", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });

    const response = await POST(request("  Reader@Example.com \n"));

    expect(response.status).toBe(200);
    expect(mocks.contactGet).toHaveBeenCalledWith({
      email: "reader@example.com",
      audienceId: "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912",
    });
    expect(mocks.emailSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "reader@example.com" }),
    );
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
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: true,
      deliveryMode: "attached",
    });
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
    const payload = mocks.emailSend.mock.calls[0][0];
    expect(payload.html).toContain("PDF is attached to this email");
    expect(payload.text).toContain("Your PDF is attached");
  });

  it("returns leadCreated false for an existing contact", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
      deliveryMode: "attached",
    });
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
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
      deliveryMode: "attached",
    });
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
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
      deliveryMode: "attached",
    });
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
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
      deliveryMode: "attached",
    });
  });

  it("sends a link-only email when PDF rendering fails", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    mocks.renderPdf.mockRejectedValue(new Error("Render failed"));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      leadCreated: false,
      deliveryMode: "link_only",
    });
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
    const payload = mocks.emailSend.mock.calls[0][0];
    expect(payload.subject).toBe("Your Macro Tracking Cheat Sheet download link");
    expect(payload.subject.toLowerCase()).not.toMatch(/attach|inside/);
    expect(payload.html.toLowerCase()).not.toContain("attach");
    expect(payload.text.toLowerCase()).not.toContain("attach");
    expect(payload.html).toContain("Use the download button below");
    expect(payload.text).toContain("Download your copy here:");
    expect(payload.html).not.toContain("apps.apple.com");
  });

  it("returns a retryable service error when Resend delivery misses its deadline", async () => {
    vi.useFakeTimers();
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    mocks.emailSend.mockReturnValue(new Promise(() => {}));

    const responsePromise = POST(request());
    await vi.advanceTimersByTimeAsync(8_000);
    const response = await responsePromise;

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.json()).toEqual({
      error: "Email delivery timed out. Please try again.",
    });
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
    process.env.VERCEL_URL = "macro-preview.vercel.app";

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

  it.each([
    ["unapproved host", "https", "caloriecue.app.attacker.example"],
    ["userinfo host", "https", "caloriecue.app@attacker.example"],
    ["unapproved Vercel project", "https", "attacker.vercel.app"],
    ["unsafe protocol", "javascript", "caloriecue.app"],
    ["comma-separated host", "https", "caloriecue.app, attacker.example"],
    ["comma-separated protocol", "https, javascript", "caloriecue.app"],
  ])("rejects a hostile forwarded %s", async (_case, proto, host) => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    const headers = new Headers({
      "x-forwarded-host": host,
      "x-forwarded-proto": proto,
    });

    const response = await POST(request("Reader@Example.com", headers));

    expect(response.status).toBe(200);
    const payload = mocks.emailSend.mock.calls[0][0];
    expect(payload.html).toContain(
      "https://caloriecue.app/api/macro-cheat-sheet/pdf",
    );
    expect(payload.text).toContain(
      "https://caloriecue.app/api/macro-cheat-sheet/pdf",
    );
    expect(payload.html).not.toContain("attacker");
    expect(payload.text).not.toContain("attacker");
    expect(payload.html).not.toContain("javascript:");
    expect(payload.text).not.toContain("javascript:");
  });

  it("uses a localhost request origin for local development", async () => {
    mocks.contactGet.mockResolvedValue({
      data: { id: "existing-contact", email: "reader@example.com" },
      error: null,
    });
    const localRequestUrl = new URL(
      "http://localhost:3000/api/macro-cheat-sheet-download",
    );

    const response = await POST(
      request("Reader@Example.com", new Headers(), localRequestUrl),
    );

    expect(response.status).toBe(200);
    const payload = mocks.emailSend.mock.calls[0][0];
    expect(payload.html).toContain(
      "http://localhost:3000/api/macro-cheat-sheet/pdf",
    );
    expect(payload.text).toContain(
      "http://localhost:3000/api/macro-cheat-sheet/pdf",
    );
  });
});
