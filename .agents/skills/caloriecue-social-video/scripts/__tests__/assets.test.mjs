import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyAssetPackage } from "../lib/assets.mjs";

const manifest = {
  version: 2,
  slug: "example",
  shots: [{ id: 1 }, { id: 2 }],
  video: { provider: "flow-browser" },
};

async function writeRequired(directory, emptyPath = null) {
  const files = [
    "brief.md",
    "manifest.json",
    "narration-script.txt",
    "social-copy.md",
    "flow-run.json",
    "generation-report.json",
    "narration.mp3",
    "alignment.json",
    "subtitles.srt",
    "shots/shot-01.mp4",
    "shots/shot-02.mp4",
  ];
  const structuredContents = {
    "manifest.json": JSON.stringify(manifest),
    "flow-run.json": JSON.stringify({
      shots: manifest.shots.map((shot) => ({ id: shot.id, status: "downloaded" })),
    }),
    "generation-report.json": JSON.stringify({ narration: { status: "complete" } }),
    "alignment.json": JSON.stringify({ words: [{ text: "Ready", start: 0, end: 0.5 }] }),
  };
  for (const relativePath of files) {
    const filePath = path.join(directory, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    const contents = structuredContents[relativePath] ?? "asset";
    await writeFile(filePath, relativePath === emptyPath ? "" : contents);
  }
}

test("reports exact missing handoff paths", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /brief\.md/);
  assert.match(result.problems.join("\n"), /shot-01\.mp4/);
});

test("rejects an empty generated asset", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory, "narration.mp3");
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /narration\.mp3.*empty/i);
});

test("accepts a complete consistently named Flow handoff", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory);
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, true);
  assert.deepEqual(result.problems, []);
});

test("rejects unresolved Flow queue state", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory);
  await writeFile(
    path.join(directory, "flow-run.json"),
    JSON.stringify({ shots: [{ id: 1, status: "submitted" }, { id: 2, status: "downloaded" }] }),
  );
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /shot 1.*submitted/i);
});
