import React from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { CHEAT_SHEET_PDF_FILENAME } from "../src/lib/cheat-sheet/CheatSheetDocument";
import { MacroCheatSheetDocument, MACRO_CHEAT_SHEET_PDF_FILENAME } from "../src/lib/macro-cheat-sheet/MacroCheatSheetDocument";
import { ProteinPortionDocument } from "../src/lib/protein-portions/ProteinPortionDocument";
import { PORTION_PDF } from "../src/lib/protein-portions/data";

async function main() {
  const directory = join(process.cwd(), "public", "downloads");
  await mkdir(directory, { recursive: true });
  // Keep the approved editorial artwork intact across builds. Both the static
  // download route and email attachment read this published copy.
  const approvedPdf = await readFile(join(process.cwd(), "assets", "pdfs", CHEAT_SHEET_PDF_FILENAME));
  if (approvedPdf.subarray(0, 5).toString() !== "%PDF-") {
    throw new Error(`Invalid approved PDF: ${CHEAT_SHEET_PDF_FILENAME}`);
  }
  await writeFile(join(directory, CHEAT_SHEET_PDF_FILENAME), approvedPdf);
  console.log(`Published approved ${CHEAT_SHEET_PDF_FILENAME} (${approvedPdf.length} bytes)`);
  // Render sequentially: react-pdf shares font state between documents.
  for (const [filename, document] of [
    [MACRO_CHEAT_SHEET_PDF_FILENAME, <MacroCheatSheetDocument />],
    [PORTION_PDF, <ProteinPortionDocument />],
  ] as const) {
    const buffer = await renderToBuffer(document);
    if (buffer.subarray(0, 5).toString() !== "%PDF-") {
      throw new Error(`Invalid generated PDF: ${filename}`);
    }
    await writeFile(join(directory, filename), buffer);
    console.log(`Built ${filename} (${buffer.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
