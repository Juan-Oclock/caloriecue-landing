import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/macro-cheat-sheet/pdf/route";

const renderPdf = vi.hoisted(() => vi.fn());

vi.mock("@/lib/macro-cheat-sheet/MacroCheatSheetDocument", () => ({
  renderMacroCheatSheetPdf: renderPdf,
  MACRO_CHEAT_SHEET_PDF_FILENAME: "caloriecue-macro-tracking-cheat-sheet.pdf",
}));

describe("GET /api/macro-cheat-sheet/pdf", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a cacheable inline PDF with a stable filename", async () => {
    renderPdf.mockResolvedValue(Buffer.from("%PDF-macro"));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain(
      'inline; filename="caloriecue-macro-tracking-cheat-sheet.pdf"',
    );
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=3600, s-maxage=86400",
    );
  });

  it("returns 500 when rendering fails", async () => {
    renderPdf.mockRejectedValue(new Error("render failed"));

    expect((await GET()).status).toBe(500);
  });
});
