import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const CHEAT_SHEET_PDF_FILENAME = "caloriecue-cheat-sheet.pdf";
export const MACRO_CHEAT_SHEET_PDF_FILENAME = "caloriecue-macro-tracking-cheat-sheet.pdf";

type PdfFilename = typeof CHEAT_SHEET_PDF_FILENAME | typeof MACRO_CHEAT_SHEET_PDF_FILENAME;
const buffers = new Map<PdfFilename, Promise<Buffer>>();

function readPdf(filename: PdfFilename): Promise<Buffer> {
  const cached = buffers.get(filename);
  if (cached) return cached;
  const pending = readFile(join(process.cwd(), "public", "downloads", filename))
    .then((buffer) => {
      if (buffer.subarray(0, 5).toString() !== "%PDF-") {
        throw new Error(`Invalid prebuilt PDF: ${filename}`);
      }
      return buffer;
    }).catch((error) => {
      buffers.delete(filename);
      throw error;
    });
  buffers.set(filename, pending);
  return pending;
}

export const readCheatSheetPdf = () => readPdf(CHEAT_SHEET_PDF_FILENAME);
export const readMacroCheatSheetPdf = () => readPdf(MACRO_CHEAT_SHEET_PDF_FILENAME);
