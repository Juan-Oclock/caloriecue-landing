import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const AUDIENCE_ID = "511ab1c1-5a5c-4b58-9d22-8bf8aaf2e912";

function getCheatSheetEmailHtml(printUrl: string) {
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
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">Everything you need on one page — ready to print.</p>
    </div>

    <div style="padding:32px 24px;">

      <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px 0;">
        Thanks for downloading the CalorieCue Calorie Counting Cheat Sheet! Click the button below to open your printable cheat sheet — then use <strong>Ctrl/Cmd + P</strong> (or the print button on the page) to save it as a PDF or print it directly.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${printUrl}" style="display:inline-block;background:#E05A3A;color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">Download Your Cheat Sheet</a>
      </div>

      <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 24px 0;">
        <strong>Your cheat sheet includes:</strong>
      </p>
      <ul style="font-size:13px;color:#666;line-height:1.8;padding-left:20px;margin:0 0 32px 0;">
        <li>Calorie target table (by weight and goal)</li>
        <li>The hand-method portion guide</li>
        <li>Common food calories quick-reference</li>
        <li>Portions that trip people up</li>
        <li>The 7 calorie counting rules</li>
      </ul>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

      <!-- App CTA -->
      <div style="text-align:center;">
        <p style="font-size:14px;color:#333;font-weight:600;margin:0 0 8px 0;">Track calories in 3 seconds</p>
        <p style="font-size:13px;color:#666;margin:0 0 16px 0;">Snap a photo. Get instant calories &amp; macros. Done.</p>
        <a href="https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-weight:600;font-size:14px;padding:10px 24px;border-radius:8px;text-decoration:none;">Download CalorieCue</a>
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
    const printUrl = `https://caloriecue.app/cheat-sheet/print`;

    const resend = getResend();

    // Add contact to Blog Leads audience and send email in parallel
    const [, sendResult] = await Promise.all([
      resend.contacts.create({
        email: normalizedEmail,
        audienceId: AUDIENCE_ID,
      }),
      resend.emails.send({
        from: "CalorieCue <hello@caloriecue.app>",
        to: normalizedEmail,
        subject: "Your Calorie Counting Cheat Sheet",
        html: getCheatSheetEmailHtml(printUrl),
        text: `Thanks for downloading the CalorieCue Calorie Counting Cheat Sheet! Open this link to view and print your cheat sheet: ${printUrl}`,
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
