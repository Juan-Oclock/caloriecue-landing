import {
  MACRO_CHEAT_SHEET_PDF_FILENAME,
  readMacroCheatSheetPdf,
} from "@/lib/cheat-sheet/prebuilt-pdfs";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  try {
    const buffer = await readMacroCheatSheetPdf();

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${MACRO_CHEAT_SHEET_PDF_FILENAME}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Macro cheat sheet PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
