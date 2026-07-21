import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { createFlowRun, fingerprintPrompt } from "../lib/flow.mjs";
import { validateManifest } from "../lib/manifest.mjs";

function flowManifest() {
  return validateManifest({
    version: 2,
    articleUrl: "https://caloriecue.app/blog/example",
    slug: "example",
    targetDurationSeconds: 64,
    narration: Array.from({ length: 130 }, () => "nutrition").join(" "),
    socialCopy: {
      instagram: "Instagram copy",
      tiktok: "TikTok copy",
      facebook: "Facebook copy",
      hashtags: ["#CalorieCue"],
    },
    video: {
      provider: "flow-browser",
      aspectRatio: "9:16",
      resolution: "1080p",
      durationSeconds: 8,
    },
    flow: {
      model: "veo-3.1-fast",
      creditTier: "non-ultra",
      outputsPerShot: 1,
    },
    geminiApi: { model: "veo-3.1-fast-generate-preview" },
    elevenlabs: {
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      voiceSettings: {},
    },
    shots: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `Shot ${index + 1}`,
      purpose: `Purpose ${index + 1}`,
      prompt: `A detailed vertical food scene for approved shot ${index + 1}, without text, logos, narration, or music.`,
    })),
  });
}

test("creates deterministic pending Flow records without secrets", () => {
  const run = createFlowRun({
    manifest: flowManifest(),
    outputDirectory: "/tmp/social-video-assets/example",
    now: "2026-07-16T00:00:00.000Z",
  });
  assert.equal(run.provider, "flow-browser");
  assert.equal(run.shots.length, 8);
  assert.equal(run.shots[0].status, "pending");
  assert.equal(run.shots[0].promptFingerprint.length, 64);
  assert.equal(run.shots[0].outputPath, path.join("/tmp/social-video-assets/example", "shots", "shot-01.mp4"));
  assert.doesNotMatch(JSON.stringify(run), /API_KEY|gemini-key|eleven-key/);
});

test("preserves a matching downloaded record on resume", () => {
  const initial = createFlowRun({ manifest: flowManifest(), outputDirectory: "/tmp/example", now: "2026-07-16T00:00:00.000Z" });
  initial.shots[0] = { ...initial.shots[0], status: "downloaded", bytes: 42, attempts: 1 };
  const resumed = createFlowRun({ manifest: flowManifest(), outputDirectory: "/tmp/example", existingRun: initial, now: "2026-07-16T01:00:00.000Z" });
  assert.equal(resumed.shots[0].status, "downloaded");
  assert.equal(resumed.shots[0].bytes, 42);
});

test("blocks a changed prompt until its shot reset is approved", () => {
  const manifest = flowManifest();
  const initial = createFlowRun({ manifest, outputDirectory: "/tmp/example" });
  manifest.shots[0].prompt += " Changed.";
  assert.throws(
    () => createFlowRun({ manifest, outputDirectory: "/tmp/example", existingRun: initial }),
    /changed prompt.*shot 1/i,
  );
  const reset = createFlowRun({ manifest, outputDirectory: "/tmp/example", existingRun: initial, resetChangedShotIds: [1] });
  assert.equal(reset.shots[0].status, "pending");
  assert.equal(reset.shots[0].replacementApproved, true);
});

test("resets only an explicitly approved unchanged failed shot", () => {
  const manifest = flowManifest();
  const initial = createFlowRun({
    manifest,
    outputDirectory: "/tmp/example",
    now: "2026-07-16T00:00:00.000Z",
  });
  initial.shots[0] = {
    ...initial.shots[0],
    status: "failed",
    attempts: 2,
    flowProjectUrl: "https://labs.google/fx/tools/flow/project/example",
    downloadedFilename: "failed-download.mp4",
    bytes: 42,
    error: "terminal Flow failure",
    failedAt: "2026-07-16T00:30:00.000Z",
    completedAt: "2026-07-16T00:31:00.000Z",
  };
  initial.shots[1] = {
    ...initial.shots[1],
    status: "failed",
    attempts: 1,
    error: "unselected failure",
  };

  const retried = createFlowRun({
    manifest,
    outputDirectory: "/tmp/example",
    existingRun: initial,
    approvedResetShotIds: [1],
    now: "2026-07-16T01:00:00.000Z",
  });

  assert.deepEqual(
    {
      status: retried.shots[0].status,
      attempts: retried.shots[0].attempts,
      flowProjectUrl: retried.shots[0].flowProjectUrl,
      downloadedFilename: retried.shots[0].downloadedFilename,
      bytes: retried.shots[0].bytes,
      error: retried.shots[0].error,
      replacementApproved: retried.shots[0].replacementApproved,
      failedAt: retried.shots[0].failedAt,
      completedAt: retried.shots[0].completedAt,
    },
    {
      status: "pending",
      attempts: 2,
      flowProjectUrl: "https://labs.google/fx/tools/flow/project/example",
      downloadedFilename: null,
      bytes: null,
      error: null,
      replacementApproved: true,
      failedAt: undefined,
      completedAt: undefined,
    },
  );
  assert.equal(retried.shots[1].status, "failed");
  assert.equal(retried.shots[1].error, "unselected failure");
});

for (const status of ["pending", "submitted", "downloaded"]) {
  test(`rejects an approved unchanged retry from ${status}`, () => {
    const manifest = flowManifest();
    const initial = createFlowRun({
      manifest,
      outputDirectory: "/tmp/example",
    });
    initial.shots[0] = { ...initial.shots[0], status };

    assert.throws(
      () =>
        createFlowRun({
          manifest,
          outputDirectory: "/tmp/example",
          existingRun: initial,
          approvedResetShotIds: [1],
        }),
      new RegExp(`shot 1.*${status}.*cannot be retried`, "i"),
    );
  });
}

test("hashes normalized prompt text consistently", () => {
  assert.equal(fingerprintPrompt("  Hello   world  "), fingerprintPrompt("Hello world"));
});
