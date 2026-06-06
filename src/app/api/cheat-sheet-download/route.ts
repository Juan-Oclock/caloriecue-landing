import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  renderCheatSheetPdf,
  CHEAT_SHEET_PDF_FILENAME,
} from "@/lib/cheat-sheet/CheatSheetDocument";

// @react-pdf/renderer (used to build the attached PDF) needs the Node runtime.
export const runtime = "nodejs";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const AUDIENCE_ID = "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912";
const PRODUCTION_URL = "https://caloriecue.app";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503";

/**
 * Resolve the base URL of the deployment that actually handled this request, so
 * the PDF download link in the email points at the right place on production,
 * Vercel previews, and local dev alike (rather than a hardcoded prod URL that
 * 404s on any deployment where the route isn't live yet).
 */
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

function getCheatSheetEmailHtml(downloadUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Calorie Counting Cheat Sheet</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#E05A3A,#FF7F5C);padding:40px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px 0;">Your Calorie Counting Cheat Sheet</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">A 5-page printable PDF — attached and ready to go.</p>
    </div>

    <div style="padding:32px 24px;">

      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px 0;">
        Thanks for grabbing the CalorieCue Calorie Counting Cheat Sheet! Your <strong>PDF is attached to this email</strong> — save it, print it, or keep it on your phone. You can also download it again any time with the button below.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${downloadUrl}" style="display:inline-block;background:#E05A3A;color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">Download the PDF</a>
      </div>

      <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 12px 0;">
        <strong>Inside your cheat sheet:</strong>
      </p>
      <ul style="font-size:13px;color:#666;line-height:1.8;padding-left:20px;margin:0 0 32px 0;">
        <li>Calorie targets by weight &amp; goal + the hand-method portion guide</li>
        <li>80+ common foods with calories (and the portions that trip people up)</li>
        <li>High-protein, low-calorie foods &amp; smart calorie-saving swaps</li>
        <li>A restaurant &amp; fast-food calorie guide</li>
        <li>A printable 7-day tracking log</li>
      </ul>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <!-- App CTA -->
      <div style="text-align:center;">
        <p style="font-size:14px;color:#333;font-weight:600;margin:0 0 8px 0;">Track calories in 3 seconds</p>
        <p style="font-size:13px;color:#666;margin:0 0 16px 0;">Snap a photo. Get instant calories &amp; macros. Done.</p>
        <a href="${APP_STORE_URL}" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 24px;border-radius:8px;text-decoration:none;">Download CalorieCue</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color:#f9f9f9;padding:16px 24px;text-align:center;">
      <p style="font-size:11px;color:#999;margin:0;">CalorieCue — AI Photo Calorie Tracker &bull; caloriecue.app</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const downloadUrl = `${getBaseUrl(req)}/api/cheat-sheet/pdf`;

    // Build the PDF to attach. If generation fails for any reason, fall back to
    // a link-only email rather than failing the whole request.
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await renderCheatSheetPdf();
    } catch (pdfError) {
      console.error("Cheat sheet PDF generation failed, sending link only:", pdfError);
    }

    const resend = getResend();

    // Add contact to Blog Leads audience and send email in parallel.
    const [, sendResult] = await Promise.all([
      resend.contacts.create({
        email: normalizedEmail,
        audienceId: AUDIENCE_ID,
      }),
      resend.emails.send({
        from: "CalorieCue <hello@track.caloriecue.app>",
        to: normalizedEmail,
        subject: "Your Calorie Counting Cheat Sheet (PDF inside)",
        html: getCheatSheetEmailHtml(downloadUrl),
        text: `Thanks for grabbing the CalorieCue Calorie Counting Cheat Sheet! Your PDF is attached. You can also download it here: ${downloadUrl}`,
        ...(pdfBuffer
          ? {
              attachments: [
                {
                  filename: CHEAT_SHEET_PDF_FILENAME,
                  content: pdfBuffer,
                },
              ],
            }
          : {}),
      }),
    ]);

    if (sendResult.error) {
      console.error("Resend send error:", sendResult.error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cheat sheet download error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
