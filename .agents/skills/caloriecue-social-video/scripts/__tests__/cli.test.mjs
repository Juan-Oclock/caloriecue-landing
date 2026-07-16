import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCli } from "../social-video.mjs";
import { loadEnvironment } from "../lib/env.mjs";

function makeManifest() {
  return {
    version: 1,
    articleUrl:
      "https://caloriecue.app/blog/high-protein-low-calorie-foods",
    slug: "high-protein-low-calorie-foods",
    targetDurationSeconds: 64,
    narration:
      "Protein labels can be misleading when calories matter. The better comparison is protein per one hundred calories, because it shows how efficiently each food supports your target. Shrimp, tuna, cod, egg whites, chicken breast, Greek yogurt, and cottage cheese all deliver useful protein without spending most of your calorie budget. Shrimp provides about twenty three grams of protein per one hundred calories, while tuna and cod are close behind. Peanut butter can still fit a balanced diet, but it is far less protein dense than lean seafood or poultry. Start each meal with a lean protein anchor. Add vegetables or fruit for volume and fiber, then choose carbohydrates and fats that fit your preferences and remaining calories. You do not need perfect meals or a restrictive food list. You need portions you can repeat consistently. Save the complete ranking for your next grocery trip, and use CalorieCue to keep your portions, protein, and calories visible without turning every meal into a math problem.",
    socialCopy: {
      instagram: "Compare protein per 100 calories.",
      tiktok: "High protein does not always mean protein dense.",
      facebook: "A practical way to compare protein foods.",
      hashtags: ["#CalorieCue", "#HighProtein", "#Nutrition"],
    },
    veo: {
      model: "veo-3.1-fast-generate-preview",
      aspectRatio: "9:16",
      resolution: "1080p",
      durationSeconds: 8,
    },
    elevenlabs: {
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.55,
        similarityBoost: 0.75,
        style: 0.15,
        useSpeakerBoost: true,
      },
    },
    shots: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: "Shot " + (index + 1),
      purpose: "Purpose " + (index + 1),
      prompt:
        "A detailed vertical food video prompt for shot " +
        (index + 1) +
        ", with no text, captions, logos, dialogue, narration, or music.",
    })),
  };
}

function makeFlowManifest(overrides = {}) {
  const { veo: _legacyVeo, ...base } = makeManifest();
  return {
    ...base,
    version: 2,
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
    geminiApi: {
      model: "veo-3.1-fast-generate-preview",
    },
    ...overrides,
  };
}

async function setupManifest(manifest = makeManifest()) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "caloriecue-cli-"));
  const manifestPath = path.join(cwd, "input", "manifest.json");
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { cwd, manifestPath };
}

function paidEnvironment() {
  return {
    GEMINI_API_KEY: "gemini-key",
    ELEVENLABS_API_KEY: "eleven-key",
    ELEVENLABS_VOICE_ID: "voice-123",
  };
}

function noNetworkDependencies() {
  const unexpected = async () => {
    throw new Error("network dependency must not be called");
  };
  return {
    listVeoModels: unexpected,
    submitVeoShot: unexpected,
    pollVeoOperation: unexpected,
    downloadVeoVideo: unexpected,
    getElevenLabsVoice: unexpected,
    generateNarration: unexpected,
    forceAlign: unexpected,
  };
}

function outputCollector() {
  const stdout = [];
  const stderr = [];
  return {
    stdout,
    stderr,
    writeOut: (value) => stdout.push(String(value)),
    writeError: (value) => stderr.push(String(value)),
  };
}

test("process environment overrides .env.local without mutating either", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "caloriecue-env-"));
  await writeFile(
    path.join(cwd, ".env.local"),
    [
      "GEMINI_API_KEY=file-gemini",
      "ELEVENLABS_API_KEY=file-eleven",
      "ELEVENLABS_VOICE_ID=file-voice",
    ].join("\n"),
  );

  const loaded = await loadEnvironment({
    cwd,
    env: { GEMINI_API_KEY: "process-gemini" },
  });

  assert.equal(loaded.GEMINI_API_KEY, "process-gemini");
  assert.equal(loaded.ELEVENLABS_API_KEY, "file-eleven");
  assert.equal(loaded.ELEVENLABS_VOICE_ID, "file-voice");
});

test("blocks paid generation when confirmation is absent", async () => {
  const { cwd, manifestPath } = await setupManifest();
  const output = outputCollector();

  const code = await runCli(
    [
      "generate",
      "--manifest",
      manifestPath,
      "--budget-usd",
      "15",
    ],
    {
      cwd,
      env: paidEnvironment(),
      dependencies: noNetworkDependencies(),
      ...output,
    },
  );

  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /confirm-paid-generation/);
});

test("rejects Gemini generation for a Flow manifest before network access", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const output = outputCollector();
  const code = await runCli(["generate", "--manifest", manifestPath, "--budget-usd", "15", "--confirm-paid-generation"], {
    cwd,
    env: paidEnvironment(),
    dependencies: noNetworkDependencies(),
    ...output,
  });
  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /requires.*gemini-api/i);
});

test("blocks paid generation when the estimate exceeds the approved budget", async () => {
  const { cwd, manifestPath } = await setupManifest();
  const output = outputCollector();

  const code = await runCli(
    [
      "generate",
      "--manifest",
      manifestPath,
      "--budget-usd",
      "5",
      "--confirm-paid-generation",
    ],
    {
      cwd,
      env: paidEnvironment(),
      dependencies: noNetworkDependencies(),
      ...output,
    },
  );

  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /\$7\.68/);
  assert.match(output.stderr.join("\n"), /\$5\.00/);
});

test("reports missing environment names without secret values", async () => {
  const { cwd, manifestPath } = await setupManifest();
  const output = outputCollector();

  const code = await runCli(
    [
      "generate",
      "--manifest",
      manifestPath,
      "--budget-usd",
      "15",
      "--confirm-paid-generation",
    ],
    {
      cwd,
      env: {},
      dependencies: noNetworkDependencies(),
      ...output,
    },
  );

  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /GEMINI_API_KEY/);
  assert.doesNotMatch(output.stderr.join("\n"), /ELEVENLABS_API_KEY/);
  assert.doesNotMatch(output.stderr.join("\n"), /ELEVENLABS_VOICE_ID/);
});

test("submits only selected shots and writes a resumable report", async () => {
  const { cwd, manifestPath } = await setupManifest();
  const output = outputCollector();
  const submitted = [];

  const dependencies = {
    ...noNetworkDependencies(),
    submitVeoShot: async (options) => {
      submitted.push(options.prompt);
      return { name: "operations/shot-" + submitted.length };
    },
    pollVeoOperation: async ({ operationName }) => ({
      name: operationName,
      done: true,
      response: {
        generateVideoResponse: {
          generatedSamples: [
            {
              video: {
                uri:
                  "https://download.example/" +
                  operationName.replace("/", "-") +
                  ".mp4",
              },
            },
          ],
        },
      },
    }),
    downloadVeoVideo: async ({ outputPath }) => {
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, Buffer.from("video"));
      return { outputPath, bytes: 5 };
    },
  };

  const code = await runCli(
    [
      "generate",
      "--manifest",
      manifestPath,
      "--shots",
      "2,5",
      "--budget-usd",
      "2",
      "--confirm-paid-generation",
    ],
    {
      cwd,
      env: paidEnvironment(),
      dependencies,
      ...output,
    },
  );

  assert.equal(code, 0);
  assert.equal(submitted.length, 2);
  assert.match(submitted[0], /shot 2/i);
  assert.match(submitted[1], /shot 5/i);

  const reportPath = path.join(
    cwd,
    "social-video-assets",
    "high-protein-low-calorie-foods",
    "generation-report.json",
  );
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  assert.equal(report.estimatedVeoCostUsd, 1.92);
  assert.deepEqual(
    report.shots.map((shot) => shot.id),
    [2, 5],
  );
  assert.ok(report.shots.every((shot) => shot.status === "complete"));
});

test("check-setup uses only non-generating account checks", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "caloriecue-check-"));
  const output = outputCollector();
  let paidCalls = 0;
  const unexpectedPaidCall = async () => {
    paidCalls += 1;
    throw new Error("paid call");
  };

  const code = await runCli(["check-setup", "--provider", "gemini-api"], {
    cwd,
    env: paidEnvironment(),
    dependencies: {
      ...noNetworkDependencies(),
      listVeoModels: async () => [
        "veo-3.1-fast-generate-preview",
      ],
      getElevenLabsVoice: async () => ({
        voice_id: "voice-123",
        name: "CalorieCue Educator",
      }),
      submitVeoShot: unexpectedPaidCall,
      generateNarration: unexpectedPaidCall,
      forceAlign: unexpectedPaidCall,
    },
    ...output,
  });

  assert.equal(code, 0);
  assert.equal(paidCalls, 0);
  assert.match(output.stdout.join("\n"), /veo-3\.1-fast/);
  assert.match(output.stdout.join("\n"), /CalorieCue Educator/);
});

test("check-setup verifies Gemini even when ElevenLabs is not configured", async () => {
  const cwd = await mkdtemp(
    path.join(os.tmpdir(), "caloriecue-partial-check-"),
  );
  const output = outputCollector();
  let geminiChecks = 0;

  const code = await runCli(["check-setup", "--provider", "gemini-api"], {
    cwd,
    env: { GEMINI_API_KEY: "gemini-key" },
    dependencies: {
      ...noNetworkDependencies(),
      listVeoModels: async () => {
        geminiChecks += 1;
        return ["veo-3.1-fast-generate-preview"];
      },
    },
    ...output,
  });

  assert.equal(code, 2);
  assert.equal(geminiChecks, 1);
  assert.match(output.stdout.join("\n"), /veo-3\.1-fast/);
  assert.match(output.stderr.join("\n"), /ELEVENLABS_API_KEY/);
  assert.match(output.stderr.join("\n"), /ELEVENLABS_VOICE_ID/);
});

test("Flow setup checks ElevenLabs but never Gemini", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "caloriecue-flow-check-"));
  const output = outputCollector();
  let geminiChecks = 0;
  const code = await runCli(["check-setup", "--provider", "flow-browser"], {
    cwd,
    env: { ELEVENLABS_API_KEY: "eleven-key", ELEVENLABS_VOICE_ID: "voice-123" },
    dependencies: {
      ...noNetworkDependencies(),
      listVeoModels: async () => { geminiChecks += 1; return []; },
      getElevenLabsVoice: async () => ({ voice_id: "voice-123", name: "CalorieCue Educator" }),
    },
    ...output,
  });
  assert.equal(code, 0);
  assert.equal(geminiChecks, 0);
  assert.match(output.stdout.join("\n"), /verify.*Chrome/i);
});

test("estimates Flow packages in credits instead of USD", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const output = outputCollector();
  const code = await runCli(["estimate", "--manifest", manifestPath], {
    cwd,
    env: {},
    dependencies: noNetworkDependencies(),
    ...output,
  });
  assert.equal(code, 0);
  assert.match(output.stdout.join("\n"), /160 Flow credits/);
  assert.doesNotMatch(output.stdout.join("\n"), /\$/);
});

test("prepares a resumable Flow file without network access", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const output = outputCollector();
  const code = await runCli(["prepare-flow", "--manifest", manifestPath], {
    cwd,
    env: {},
    dependencies: noNetworkDependencies(),
    ...output,
  });
  assert.equal(code, 0);
  const run = JSON.parse(await readFile(path.join(cwd, "social-video-assets", "high-protein-low-calorie-foods", "flow-run.json"), "utf8"));
  assert.equal(run.shots.length, 8);
  assert.ok(run.shots.every((shot) => shot.status === "pending"));
});

test("requires explicit shot IDs and confirmation to reset a changed Flow prompt", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const output = outputCollector();
  assert.equal(await runCli(["prepare-flow", "--manifest", manifestPath], {
    cwd,
    env: {},
    dependencies: noNetworkDependencies(),
    ...output,
  }), 0);

  manifest.shots[0].prompt += " Revised after approval.";
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  const blocked = outputCollector();
  assert.equal(await runCli(["prepare-flow", "--manifest", manifestPath], {
    cwd,
    env: {},
    dependencies: noNetworkDependencies(),
    ...blocked,
  }), 1);
  assert.match(blocked.stderr.join("\n"), /changed prompt.*shot 1/i);

  const approved = outputCollector();
  assert.equal(await runCli([
    "prepare-flow",
    "--manifest", manifestPath,
    "--shots", "1",
    "--confirm-flow-retry",
  ], {
    cwd,
    env: {},
    dependencies: noNetworkDependencies(),
    ...approved,
  }), 0);
  const run = JSON.parse(await readFile(path.join(cwd, "social-video-assets", manifest.slug, "flow-run.json"), "utf8"));
  assert.equal(run.shots[0].replacementApproved, true);
});

test("selective regeneration preserves previously completed shot records", async () => {
  const { cwd, manifestPath } = await setupManifest();
  const output = outputCollector();
  const outputDirectory = path.join(
    cwd,
    "social-video-assets",
    "high-protein-low-calorie-foods",
  );
  const firstShotPath = path.join(
    outputDirectory,
    "shots",
    "shot-01.mp4",
  );
  await mkdir(path.dirname(firstShotPath), { recursive: true });
  await writeFile(firstShotPath, Buffer.from("existing"));
  await writeFile(
    path.join(outputDirectory, "generation-report.json"),
    JSON.stringify({
      version: 1,
      startedAt: "2026-07-16T00:00:00.000Z",
      shots: [
        {
          id: 1,
          title: "Shot 1",
          status: "complete",
          operationName: "operations/original-1",
          outputPath: firstShotPath,
          bytes: 8,
        },
      ],
      narration: { status: "complete" },
    }),
  );

  const dependencies = {
    ...noNetworkDependencies(),
    submitVeoShot: async () => ({ name: "operations/retry-2" }),
    pollVeoOperation: async ({ operationName }) => ({
      name: operationName,
      done: true,
      response: {
        generateVideoResponse: {
          generatedSamples: [
            { video: { uri: "https://download.example/retry.mp4" } },
          ],
        },
      },
    }),
    downloadVeoVideo: async ({ outputPath }) => {
      await writeFile(outputPath, Buffer.from("replacement"));
      return { outputPath, bytes: 11 };
    },
  };

  const code = await runCli(
    [
      "generate",
      "--manifest",
      manifestPath,
      "--shots",
      "2",
      "--budget-usd",
      "1",
      "--confirm-paid-generation",
    ],
    {
      cwd,
      env: paidEnvironment(),
      dependencies,
      ...output,
    },
  );

  assert.equal(code, 0);
  const report = JSON.parse(
    await readFile(
      path.join(outputDirectory, "generation-report.json"),
      "utf8",
    ),
  );
  assert.deepEqual(
    report.shots.map((shot) => shot.id),
    [1, 2],
  );
  assert.equal(report.shots[0].status, "complete");
  assert.equal(report.shots[1].status, "complete");
});

test("full Gemini generation is video-only and never spends ElevenLabs credits", async () => {
  const { cwd, manifestPath } = await setupManifest();
  const output = outputCollector();
  let submitted = 0;
  let narrationCalls = 0;
  let alignmentCalls = 0;
  const outputDirectory = path.join(
    cwd,
    "social-video-assets",
    "high-protein-low-calorie-foods",
  );
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, "generation-report.json"),
    JSON.stringify({
      version: 1,
      startedAt: "2026-07-16T00:00:00.000Z",
      shots: [],
      narration: {
        status: "failed",
        error: "legacy narration failure",
      },
    }),
  );

  const dependencies = {
    ...noNetworkDependencies(),
    submitVeoShot: async () => {
      submitted += 1;
      return { name: "operations/full-" + submitted };
    },
    pollVeoOperation: async ({ operationName }) => ({
      name: operationName,
      done: true,
      response: {
        generateVideoResponse: {
          generatedSamples: [
            { video: { uri: "https://download.example/full.mp4" } },
          ],
        },
      },
    }),
    downloadVeoVideo: async ({ outputPath }) => {
      await writeFile(outputPath, Buffer.from("video"));
      return { outputPath, bytes: 5 };
    },
    generateNarration: async ({ outputPath }) => {
      narrationCalls += 1;
      await writeFile(outputPath, Buffer.from("audio"));
      return {
        outputPath,
        bytes: 5,
        characterCost: 100,
        requestId: "narration-request",
      };
    },
    forceAlign: async () => {
      alignmentCalls += 1;
      return {
        words: [],
        characters: [],
        loss: 0.01,
      };
    },
  };

  const code = await runCli(
    [
      "generate",
      "--manifest",
      manifestPath,
      "--budget-usd",
      "8",
      "--confirm-paid-generation",
    ],
    {
      cwd,
      env: paidEnvironment(),
      dependencies,
      ...output,
    },
  );

  assert.equal(code, 0);
  assert.equal(submitted, 8);
  assert.equal(narrationCalls, 0);
  assert.equal(alignmentCalls, 0);
  const report = JSON.parse(
    await readFile(
      path.join(outputDirectory, "generation-report.json"),
      "utf8",
    ),
  );
  assert.equal(report.narration.status, "failed");
});
