import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  MACRO_CHEAT_SHEET_PDF_FILENAME,
  renderMacroCheatSheetPdf,
} from "@/lib/macro-cheat-sheet/MacroCheatSheetDocument";
import {
  CONTACT_STAGE_BUDGET_MS,
  PDF_RENDER_STAGE_BUDGET_MS,
  RATE_LIMIT_STAGE_BUDGET_MS,
  RESEND_STAGE_BUDGET_MS,
  SERVER_REQUEST_BUDGET_MS,
  ServerRequestBudget,
  ServerRequestBudgetExceededError,
  UNCERTAIN_DELIVERY_MESSAGE,
} from "@/lib/macro-cheat-sheet/delivery-budget";
import { createDeliveryIdempotencyKey } from "@/lib/macro-cheat-sheet/delivery-security";
import { checkMacroCheatSheetRateLimit } from "@/lib/macro-cheat-sheet/rate-limit";

// @react-pdf/renderer (used to build the attached PDF) needs the Node runtime.
export const runtime = "nodejs";

const AUDIENCE_ID = "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912";
const MAX_REQUEST_BYTES = 4_096;
const MAX_EMAIL_LENGTH = 254;
const RETRY_AFTER_SECONDS = 60;
const PRODUCTION_URL = "https://caloriecue.app";

class RequestBodyTooLargeError extends Error {}
class EmailDeliveryTimeoutError extends Error {}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getSingleHeaderValue(value: string | null): string | null {
  if (!value || value.includes(",")) return null;
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function getApprovedVercelHosts(): Set<string> {
  const hosts = new Set<string>();
  for (const value of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (!value || value.includes(",")) continue;
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      if (
        url.protocol === "https:" &&
        url.hostname.endsWith(".vercel.app") &&
        !url.username &&
        !url.password &&
        url.pathname === "/" &&
        !url.search &&
        !url.hash
      ) {
        hosts.add(url.host.toLowerCase());
      }
    } catch {
      // Ignore malformed deployment environment values.
    }
  }
  return hosts;
}

function getApprovedOrigin(protocol: string, host: string): URL | null {
  if (protocol !== "https" && protocol !== "http") return null;

  try {
    const url = new URL(`${protocol}://${host}`);
    if (
      url.protocol !== `${protocol}:` ||
      url.host.toLowerCase() !== host.toLowerCase() ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    if (url.origin === PRODUCTION_URL) return url;

    const isLocalDevelopmentHost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]";
    if (isLocalDevelopmentHost && process.env.NODE_ENV !== "production") {
      return url;
    }

    if (
      url.protocol === "https:" &&
      getApprovedVercelHosts().has(url.host.toLowerCase())
    ) {
      return url;
    }
  } catch {
    // Fall through to the trusted production URL.
  }

  return null;
}

function getBaseUrl(req: NextRequest): URL {
  const forwardedHost = getSingleHeaderValue(
    req.headers.get("x-forwarded-host"),
  );
  const forwardedProtocol = getSingleHeaderValue(
    req.headers.get("x-forwarded-proto"),
  );
  if (forwardedHost && forwardedProtocol) {
    const forwardedOrigin = getApprovedOrigin(
      forwardedProtocol,
      forwardedHost,
    );
    if (forwardedOrigin) return forwardedOrigin;
  }

  try {
    const requestOrigin = getApprovedOrigin(
      req.nextUrl.protocol.slice(0, -1),
      req.nextUrl.host,
    );
    if (requestOrigin) return requestOrigin;
  } catch {
    // Fall through to the trusted production URL.
  }

  return new URL(PRODUCTION_URL);
}

function getClientIp(req: NextRequest): string | null {
  for (const headerName of [
    "x-vercel-forwarded-for",
    "x-forwarded-for",
    "x-real-ip",
  ]) {
    const value = req.headers.get(headerName);
    if (!value || value.length > 512) continue;

    for (const candidate of value.split(",").slice(0, 8)) {
      const address = candidate.trim();
      if (address.length <= 45 && isIP(address) !== 0) return address;
    }
  }

  return null;
}

async function readBoundedRequestBody(req: NextRequest): Promise<string> {
  const contentLength = req.headers.get("content-length");
  if (
    contentLength &&
    /^\d+$/.test(contentLength) &&
    Number(contentLength) > MAX_REQUEST_BYTES
  ) {
    throw new RequestBodyTooLargeError();
  }

  if (!req.body) return "";

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new RequestBodyTooLargeError();
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

function retryableServiceResponse(error: string) {
  return NextResponse.json(
    { error },
    {
      status: 503,
      headers: { "Retry-After": String(RETRY_AFTER_SECONDS) },
    },
  );
}

function uncertainDeliveryResponse() {
  return NextResponse.json(
    {
      error: UNCERTAIN_DELIVERY_MESSAGE,
      deliveryStatus: "uncertain" as const,
    },
    {
      status: 503,
      headers: { "Retry-After": String(RETRY_AFTER_SECONDS) },
    },
  );
}

function getMacroCheatSheetEmailHtml(
  downloadUrl: string,
  hasAttachment: boolean,
) {
  const deliverySummary = hasAttachment
    ? "Your download includes five printable reference sheets plus a cover — attached and ready to go."
    : "Your download includes five printable reference sheets plus a cover — ready to download.";
  const deliveryInstructions = hasAttachment
    ? "Your <strong>PDF is attached to this email</strong> — save it, print it, or keep it on your phone. You can also download it again any time with the button below."
    : "Your PDF is ready. Use the download button below to save it, print it, or keep it on your phone.";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Macro Tracking Cheat Sheet</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background-color:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#E05A3A,#FF7F5C);padding:40px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px 0;">Your Macro Tracking Cheat Sheet</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">${deliverySummary}</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px 0;">Thanks for grabbing the CalorieCue Macro Tracking Cheat Sheet! ${deliveryInstructions}</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${downloadUrl}" style="display:inline-block;background:#E05A3A;color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">Download the PDF</a>
      </div>
      <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 12px 0;"><strong>Inside your cheat sheet:</strong></p>
      <ul style="font-size:13px;color:#666;line-height:1.8;padding-left:20px;margin:0;">
        <li>A quick start for setting and tracking your macros</li>
        <li>Three food charts for protein, carbs, and fats</li>
        <li>A meal builder for putting balanced plates together</li>
        <li>A printable seven-day macro tracking log</li>
      </ul>
    </div>
    <div style="background-color:#f9f9f9;padding:16px 24px;text-align:center;">
      <p style="font-size:11px;color:#999;margin:0;">CalorieCue — AI Photo Calorie Tracker &bull; caloriecue.app</p>
    </div>
  </div>
</body>
</html>`;
}

async function resolveContact(
  resend: ReturnType<typeof getResend>,
  normalizedEmail: string,
): Promise<boolean> {
  try {
    const existingContact = await resend.contacts.get({
      email: normalizedEmail,
      audienceId: AUDIENCE_ID,
    });

    if (existingContact.data) return false;

    if (existingContact.error?.name === "not_found") {
      const contactResult = await resend.contacts.create({
        email: normalizedEmail,
        audienceId: AUDIENCE_ID,
      });

      if (contactResult.error) {
        console.error("Resend contact creation error:", contactResult.error);
      }
      return Boolean(contactResult.data);
    }

    if (existingContact.error) {
      console.error("Resend contact lookup error:", existingContact.error);
    }
  } catch (contactError) {
    console.error("Resend contact operation failed:", contactError);
  }

  return false;
}

async function resolveContactWithinBudget(
  resend: ReturnType<typeof getResend>,
  normalizedEmail: string,
  requestBudget: ServerRequestBudget,
): Promise<boolean> {
  try {
    return await requestBudget.run(
      "contact resolution",
      CONTACT_STAGE_BUDGET_MS,
      () => resolveContact(resend, normalizedEmail),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const requestBudget = new ServerRequestBudget();
  let parsedBody: unknown;
  try {
    const body = await requestBudget.run(
      "request body",
      SERVER_REQUEST_BUDGET_MS,
      () => readBoundedRequestBody(req),
    );
    parsedBody = JSON.parse(body);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { error: "Request body is too large" },
        { status: 413 },
      );
    }
    if (error instanceof ServerRequestBudgetExceededError) {
      return retryableServiceResponse(
        "Download delivery is temporarily unavailable. Please try again.",
      );
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (
    typeof parsedBody !== "object" ||
    parsedBody === null ||
    Array.isArray(parsedBody)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, website } = parsedBody as Record<string, unknown>;
  if (website !== undefined && typeof website !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  if (
    !normalizedEmail ||
    normalizedEmail.length > MAX_EMAIL_LENGTH ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  const ipAddress = getClientIp(req);
  if (!ipAddress) {
    return retryableServiceResponse(
      "Download delivery is temporarily unavailable. Please try again.",
    );
  }

  try {
    const decision = await requestBudget.run(
      "rate limiting",
      RATE_LIMIT_STAGE_BUDGET_MS,
      () =>
        checkMacroCheatSheetRateLimit({
          normalizedEmail,
          ipAddress,
        }),
    );
    if (!decision.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, decision.retryAfterSeconds)),
          },
        },
      );
    }
  } catch (error) {
    console.error("Macro cheat sheet rate-limit error:", error);
    return retryableServiceResponse(
      "Download delivery is temporarily unavailable. Please try again.",
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 },
    );
  }

  try {
    const downloadUrl = new URL(
      "/api/macro-cheat-sheet/pdf",
      getBaseUrl(req),
    ).toString();

    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await requestBudget.run(
        "PDF rendering",
        PDF_RENDER_STAGE_BUDGET_MS,
        () => renderMacroCheatSheetPdf(),
      );
    } catch (pdfError) {
      console.error(
        "Macro cheat sheet PDF generation failed, sending link only:",
        pdfError,
      );
    }

    const deliveryMode = pdfBuffer ? "attached" : "link_only";
    const idempotencyKey = createDeliveryIdempotencyKey({
      normalizedEmail,
      deliveryMode,
    });
    const resend = getResend();
    const contactResolution = resolveContactWithinBudget(
      resend,
      normalizedEmail,
      requestBudget,
    );

    let sendResult;
    try {
      sendResult = await requestBudget.run(
        "Resend delivery",
        RESEND_STAGE_BUDGET_MS,
        () =>
          resend.emails.send(
            {
              from: "CalorieCue <hello@track.caloriecue.app>",
              to: normalizedEmail,
              subject: pdfBuffer
                ? "Your Macro Tracking Cheat Sheet (PDF inside)"
                : "Your Macro Tracking Cheat Sheet download link",
              html: getMacroCheatSheetEmailHtml(downloadUrl, pdfBuffer !== null),
              text: pdfBuffer
                ? `Thanks for grabbing the CalorieCue Macro Tracking Cheat Sheet! Your PDF is attached. You can also download it here: ${downloadUrl}`
                : `Thanks for grabbing the CalorieCue Macro Tracking Cheat Sheet! Download your copy here: ${downloadUrl}`,
              ...(pdfBuffer
                ? {
                    attachments: [
                      {
                        filename: MACRO_CHEAT_SHEET_PDF_FILENAME,
                        content: pdfBuffer,
                      },
                    ],
                  }
                : {}),
            },
            { idempotencyKey },
          ),
        () => new EmailDeliveryTimeoutError(),
      );
    } catch (error) {
      if (error instanceof EmailDeliveryTimeoutError) {
        return uncertainDeliveryResponse();
      }
      throw error;
    }

    if (sendResult.error) {
      console.error("Resend send error:", sendResult.error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    const leadCreated = await contactResolution;
    return NextResponse.json({ success: true, leadCreated, deliveryMode });
  } catch (error) {
    console.error("Macro cheat sheet download error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
