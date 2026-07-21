import type { NextRequest } from "next/server";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
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
