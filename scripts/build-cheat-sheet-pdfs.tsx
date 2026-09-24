import React from "react";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { CheatSheetDocument, CHEAT_SHEET_PDF_FILENAME } from "../src/lib/cheat-sheet/CheatSheetDocument";
import { MacroCheatSheetDocument, MACRO_CHEAT_SHEET_PDF_FILENAME } from "../src/lib/macro-cheat-sheet/MacroCheatSheetDocument";

async function main() {
  const directory = join(process.cwd(), "public", "downloads");
  await mkdir(directory, { recursive: true });
  // Render sequentially: react-pdf shares font state between documents.
  for (const [filename, document] of [
    [CHEAT_SHEET_PDF_FILENAME, <CheatSheetDocument />],
    [MACRO_CHEAT_SHEET_PDF_FILENAME, <MacroCheatSheetDocument />],
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
