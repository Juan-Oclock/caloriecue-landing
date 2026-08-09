import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  MACRO_CHEAT_SHEET_PDF_FILENAME,
  renderMacroCheatSheetPdf,
} from "@/lib/macro-cheat-sheet/MacroCheatSheetDocument";

// @react-pdf/renderer (used to build the attached PDF) needs the Node runtime.
export const runtime = "nodejs";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const AUDIENCE_ID = "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912";
const CONTACT_RESOLUTION_TIMEOUT_MS = 1_000;
const PRODUCTION_URL = "https://caloriecue.app";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

function getBaseUrl(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${forwardedHost}`;
  }
  try {
    return req.nextUrl.origin;
  } catch {
    return PRODUCTION_URL;
  }
}

function getMacroCheatSheetEmailHtml(downloadUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Macro Tracking Cheat Sheet</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
    <div style="background:linear-gradient(135deg,#E05A3A,#FF7F5C);padding:40px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px 0;">Your Macro Tracking Cheat Sheet</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">Your download includes five printable reference sheets plus a cover — attached and ready to go.</p>
    </div>

    <div style="padding:32px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px 0;">
        Thanks for grabbing the CalorieCue Macro Tracking Cheat Sheet! Your <strong>PDF is attached to this email</strong> — save it, print it, or keep it on your phone. You can also download it again any time with the button below.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${downloadUrl}" style="display:inline-block;background:#E05A3A;color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">Download the PDF</a>
      </div>

      <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 12px 0;">
        <strong>Inside your cheat sheet:</strong>
      </p>
      <ul style="font-size:13px;color:#666;line-height:1.8;padding-left:20px;margin:0 0 32px 0;">
        <li>A quick start for setting and tracking your macros</li>
        <li>Three food charts for protein, carbs, and fats</li>
        <li>A meal builder for putting balanced plates together</li>
        <li>A printable seven-day macro tracking log</li>
      </ul>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <div style="text-align:center;">
        <p style="font-size:14px;color:#333;font-weight:600;margin:0 0 8px 0;">Track macros in 3 seconds</p>
        <p style="font-size:13px;color:#666;margin:0 0 16px 0;">Snap a photo. Get instant calories &amp; macros. Done.</p>
        <a href="${APP_STORE_URL}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 24px;border-radius:8px;text-decoration:none;">Download CalorieCue</a>
      </div>
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

function resolveContactWithinTimeout(
  resend: ReturnType<typeof getResend>,
  normalizedEmail: string,
): Promise<boolean> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timeoutId = setTimeout(
      () => resolve(false),
      CONTACT_RESOLUTION_TIMEOUT_MS,
    );
  });

  return Promise.race([resolveContact(resend, normalizedEmail), timeout]).finally(
    () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    },
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const downloadUrl = `${getBaseUrl(req)}/api/macro-cheat-sheet/pdf`;

    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await renderMacroCheatSheetPdf();
    } catch (pdfError) {
      console.error(
        "Macro cheat sheet PDF generation failed, sending link only:",
        pdfError,
      );
    }

    const resend = getResend();
    const contactResolution = resolveContactWithinTimeout(
      resend,
      normalizedEmail,
    );
    const emailDelivery = resend.emails.send({
      from: "CalorieCue <hello@track.caloriecue.app>",
      to: normalizedEmail,
      subject: "Your Macro Tracking Cheat Sheet (PDF inside)",
      html: getMacroCheatSheetEmailHtml(downloadUrl),
      text: `Thanks for grabbing the CalorieCue Macro Tracking Cheat Sheet! Your PDF is attached. You can also download it here: ${downloadUrl}`,
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
    });
    const sendResult = await emailDelivery;

    if (sendResult.error) {
      console.error("Resend send error:", sendResult.error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    const leadCreated = await contactResolution;
    return NextResponse.json({ success: true, leadCreated });
  } catch (error) {
    console.error("Macro cheat sheet download error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
