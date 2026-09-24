import { readFile } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";

for (const [route, filename] of [
  ["cheat-sheet", "caloriecue-cheat-sheet.pdf"],
  ["macro-cheat-sheet", "caloriecue-macro-tracking-cheat-sheet.pdf"],
]) {
  const source = await readFile(join("public/downloads", filename));
  const output = await readFile(join(".next/server/app/api", route, "pdf.body"));
  assert.equal(source.subarray(0, 5).toString(), "%PDF-");
  assert.ok(source.equals(output), `${route}: static response must match the prebuilt PDF`);
  const tracePath = join(".next/server/app/api", `${route}-download`, "route.js.nft.json");
  const { files } = JSON.parse(await readFile(tracePath, "utf8"));
  assert.ok(files.some((file) => file.endsWith(`/downloads/${filename}`)), `${route}: email attachment missing from function bundle`);
  assert.ok(!files.some((file) => /@react-pdf|yoga-layout|fontkit/.test(file)), `${route}: PDF renderer must not ship in the email function`);
  console.log(`Verified ${filename}: static download and bundled email attachment, without runtime rendering.`);
}
