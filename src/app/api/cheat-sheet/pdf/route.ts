import {
  readCheatSheetPdf,
  CHEAT_SHEET_PDF_FILENAME,
} from "@/lib/cheat-sheet/prebuilt-pdfs";

// Read the build-generated PDF; no rendering runs in the request path.
export const runtime = "nodejs";
export const dynamic = "force-static";

/**
 * GET /api/cheat-sheet/pdf
 * Streams the real, multi-page Calorie Counting Cheat Sheet PDF as a download.
 * Used by the lead-magnet email's fallback link and the form's instant-download.
 */
export async function GET() {
  try {
    const buffer = await readCheatSheetPdf();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${CHEAT_SHEET_PDF_FILENAME}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Cheat sheet PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
