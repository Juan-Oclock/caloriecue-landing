import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyAssetPackage } from "../lib/assets.mjs";
import {
  fingerprintAlignmentSource,
  fingerprintBytes,
  fingerprintNarrationInput,
} from "../lib/narration.mjs";

const manifest = {
  version: 2,
  slug: "example",
  narration: "Exact approved narration.",
  elevenlabs: {
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    voiceSettings: { stability: 0.55 },
  },
  shots: [{ id: 1 }, { id: 2 }],
  video: { provider: "flow-browser" },
};

async function writeRequired(directory, emptyPath = null) {
  const audioBytes = Buffer.from("asset");
  const inputFingerprint = fingerprintNarrationInput({
    text: manifest.narration,
    voiceId: "voice-123",
    modelId: manifest.elevenlabs.modelId,
    outputFormat: manifest.elevenlabs.outputFormat,
    voiceSettings: manifest.elevenlabs.voiceSettings,
  });
  const audioFingerprint = fingerprintBytes(audioBytes);
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
    "generation-report.json": JSON.stringify({
      narration: {
        status: "complete",
        voiceId: "voice-123",
        inputFingerprint,
        audioFingerprint,
        alignmentSourceFingerprint: fingerprintAlignmentSource({
          text: manifest.narration,
          narrationInputFingerprint: inputFingerprint,
          audioFingerprint,
        }),
      },
    }),
    "narration.mp3": audioBytes,
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

test("reports each absent structured JSON file once as missing", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });

  assert.deepEqual(
    result.problems.filter((problem) => problem.startsWith("flow-run.json")),
    ["flow-run.json is missing"],
  );
  assert.deepEqual(
    result.problems.filter((problem) =>
      problem.startsWith("generation-report.json"),
    ),
    ["generation-report.json is missing"],
  );
});

test("reports malformed existing structured JSON as invalid", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory);
  await writeFile(path.join(directory, "flow-run.json"), "{not-json");

  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /flow-run\.json is invalid JSON/i);
  assert.doesNotMatch(result.problems.join("\n"), /flow-run\.json is missing/i);
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

test("rejects a narration report that does not match the current manifest", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory);
  await writeFile(
    path.join(directory, "generation-report.json"),
    JSON.stringify({
      narration: {
        status: "complete",
        voiceId: "voice-123",
        inputFingerprint: "stale-input",
        audioFingerprint: fingerprintBytes(Buffer.from("asset")),
        alignmentSourceFingerprint: "stale-alignment",
      },
    }),
  );

  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /narration.*(fingerprint|identity)/i);
});
