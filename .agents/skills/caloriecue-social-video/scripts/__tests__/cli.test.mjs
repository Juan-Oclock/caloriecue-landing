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
import {
  fingerprintAlignmentSource,
  fingerprintBytes,
  fingerprintNarrationInput,
} from "../lib/narration.mjs";

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

function narrationIdentity(manifest, voiceId, audioBytes) {
  const inputFingerprint = fingerprintNarrationInput({
    text: manifest.narration,
    voiceId,
    modelId: manifest.elevenlabs.modelId,
    outputFormat: manifest.elevenlabs.outputFormat,
    voiceSettings: manifest.elevenlabs.voiceSettings,
  });
  const audioFingerprint = fingerprintBytes(audioBytes);
  return {
    voiceId,
    inputFingerprint,
    audioFingerprint,
    alignmentSourceFingerprint: fingerprintAlignmentSource({
      text: manifest.narration,
      narrationInputFingerprint: inputFingerprint,
      audioFingerprint,
    }),
  };
}

async function writeCompleteFlowHandoff(
  cwd,
  manifest,
  { voiceId = "voice-123", audioBytes = Buffer.from("narration audio") } = {},
) {
  const directory = path.join(
    cwd,
    "social-video-assets",
    manifest.slug,
  );
  const files = [
    "brief.md",
    "manifest.json",
    "narration-script.txt",
    "social-copy.md",
    "generation-report.json",
    "narration.mp3",
    "alignment.json",
    "subtitles.srt",
    "flow-run.json",
    ...manifest.shots.map(
      (shot) => `shots/shot-${String(shot.id).padStart(2, "0")}.mp4`,
    ),
  ];
  const identity = narrationIdentity(manifest, voiceId, audioBytes);
  const contents = {
    "generation-report.json": JSON.stringify({
      narration: { status: "complete", ...identity },
    }),
    "narration.mp3": audioBytes,
    "alignment.json": JSON.stringify({
      words: [{ text: "Narration", start: 0, end: 0.5 }],
    }),
    "subtitles.srt": "1\n00:00:00,000 --> 00:00:00,500\nNarration\n",
    "flow-run.json": JSON.stringify({
      shots: manifest.shots.map((shot) => ({
        id: shot.id,
        status: "downloaded",
      })),
    }),
  };
  for (const relativePath of files) {
    const filePath = path.join(directory, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents[relativePath] ?? "asset");
  }
  return directory;
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

async function runNarrationForTest({
  cwd,
  manifestPath,
  voiceId = "voice-123",
  dependencies = noNetworkDependencies(),
  replacement = false,
  confirmGeneration = true,
  output = outputCollector(),
}) {
  const argv = ["narrate", "--manifest", manifestPath];
  if (confirmGeneration) argv.push("--confirm-elevenlabs-generation");
  if (replacement) argv.push("--confirm-elevenlabs-replacement");
  const code = await runCli(argv, {
    cwd,
    env: {
      ELEVENLABS_API_KEY: "eleven-key",
      ELEVENLABS_VOICE_ID: voiceId,
    },
    dependencies,
    ...output,
  });
  return { code, output };
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

test("approved Flow retry resets only selected unchanged failed shots", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  assert.equal(
    await runCli(["prepare-flow", "--manifest", manifestPath], {
      cwd,
      env: {},
      dependencies: noNetworkDependencies(),
    }),
    0,
  );

  const runPath = path.join(
    cwd,
    "social-video-assets",
    manifest.slug,
    "flow-run.json",
  );
  const failed = JSON.parse(await readFile(runPath, "utf8"));
  failed.shots[0] = {
    ...failed.shots[0],
    status: "failed",
    attempts: 2,
    flowProjectUrl: "https://labs.google/fx/tools/flow/project/example",
    error: "selected failure",
    failedAt: "2026-07-16T00:30:00.000Z",
  };
  failed.shots[1] = {
    ...failed.shots[1],
    status: "failed",
    attempts: 1,
    error: "unselected failure",
  };
  await writeFile(runPath, JSON.stringify(failed, null, 2));

  const output = outputCollector();
  const code = await runCli(
    [
      "prepare-flow",
      "--manifest",
      manifestPath,
      "--shots",
      "1",
      "--confirm-flow-retry",
    ],
    {
      cwd,
      env: {},
      dependencies: noNetworkDependencies(),
      ...output,
    },
  );

  assert.equal(code, 0);
  const retried = JSON.parse(await readFile(runPath, "utf8"));
  assert.equal(retried.shots[0].status, "pending");
  assert.equal(retried.shots[0].attempts, 2);
  assert.equal(
    retried.shots[0].flowProjectUrl,
    "https://labs.google/fx/tools/flow/project/example",
  );
  assert.equal(retried.shots[0].error, null);
  assert.equal(retried.shots[0].replacementApproved, true);
  assert.equal(retried.shots[0].failedAt, undefined);
  assert.equal(retried.shots[1].status, "failed");
  assert.equal(retried.shots[1].error, "unselected failure");
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

test("blocks narration when ElevenLabs confirmation is absent", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const output = outputCollector();
  const code = await runCli(["narrate", "--manifest", manifestPath], {
    cwd,
    env: {
      ELEVENLABS_API_KEY: "eleven-key",
      ELEVENLABS_VOICE_ID: "voice-123",
    },
    dependencies: noNetworkDependencies(),
    ...output,
  });
  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /confirm-elevenlabs-generation/);
});

test("narrate produces audio, alignment, and SRT without Gemini", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const output = outputCollector();
  let geminiCalls = 0;
  const dependencies = {
    ...noNetworkDependencies(),
    listVeoModels: async () => {
      geminiCalls += 1;
      return [];
    },
    submitVeoShot: async () => {
      geminiCalls += 1;
      throw new Error("Gemini called");
    },
    generateNarration: async ({ outputPath }) => {
      await writeFile(outputPath, Buffer.from("audio"));
      return {
        outputPath,
        bytes: 5,
        characterCost: 130,
        requestId: "narration-request",
      };
    },
    forceAlign: async () => ({
      words: [
        { text: "Protein", start: 0, end: 0.5 },
        { text: "matters.", start: 0.6, end: 1.1 },
      ],
      characters: [],
      loss: 0.01,
    }),
  };
  const code = await runCli(
    [
      "narrate",
      "--manifest",
      manifestPath,
      "--confirm-elevenlabs-generation",
    ],
    {
      cwd,
      env: {
        ELEVENLABS_API_KEY: "eleven-key",
        ELEVENLABS_VOICE_ID: "voice-123",
      },
      dependencies,
      ...output,
    },
  );
  assert.equal(code, 0);
  assert.equal(geminiCalls, 0);
  const directory = path.join(
    cwd,
    "social-video-assets",
    "high-protein-low-calorie-foods",
  );
  assert.equal(
    await readFile(path.join(directory, "narration.mp3"), "utf8"),
    "audio",
  );
  assert.match(
    await readFile(path.join(directory, "subtitles.srt"), "utf8"),
    /Protein matters\./,
  );
});

test("narrate resumes at alignment when narration already exists", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const directory = path.join(
    cwd,
    "social-video-assets",
    "high-protein-low-calorie-foods",
  );
  await mkdir(directory, { recursive: true });
  const audioBytes = Buffer.from("existing audio");
  await writeFile(path.join(directory, "narration.mp3"), audioBytes);
  await writeFile(
    path.join(directory, "generation-report.json"),
    JSON.stringify({
      narration: {
        status: "complete",
        ...narrationIdentity(manifest, "voice-123", audioBytes),
      },
    }),
  );
  let narrationCalls = 0;
  let alignmentCalls = 0;
  const code = await runCli(
    [
      "narrate",
      "--manifest",
      manifestPath,
      "--confirm-elevenlabs-generation",
    ],
    {
      cwd,
      env: {
        ELEVENLABS_API_KEY: "eleven-key",
        ELEVENLABS_VOICE_ID: "voice-123",
      },
      dependencies: {
        ...noNetworkDependencies(),
        generateNarration: async () => {
          narrationCalls += 1;
          throw new Error("unexpected narration");
        },
        forceAlign: async () => {
          alignmentCalls += 1;
          return {
            words: [{ text: "Existing", start: 0, end: 0.5 }],
            characters: [],
            loss: 0.01,
          };
        },
      },
    },
  );
  assert.equal(code, 0);
  assert.equal(narrationCalls, 0);
  assert.equal(alignmentCalls, 1);
});

test("narrate blocks stale audio when approved inputs change", async (t) => {
  const cases = [
    {
      name: "narration text",
      mutate(manifest) {
        manifest.narration = manifest.narration.replace(
          "Protein labels",
          "Nutrition labels",
        );
      },
    },
    {
      name: "voice ID",
      voiceId: "voice-456",
      mutate() {},
    },
    {
      name: "model",
      mutate(manifest) {
        manifest.elevenlabs.modelId = "eleven_v3";
      },
    },
    {
      name: "voice settings",
      mutate(manifest) {
        manifest.elevenlabs.voiceSettings.stability = 0.7;
      },
    },
  ];

  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      const manifest = makeFlowManifest();
      const { cwd, manifestPath } = await setupManifest(manifest);
      const directory = await writeCompleteFlowHandoff(cwd, manifest);
      const narrationPath = path.join(directory, "narration.mp3");
      const alignmentPath = path.join(directory, "alignment.json");
      const subtitlesPath = path.join(directory, "subtitles.srt");
      const originalAudio = await readFile(narrationPath);
      const originalAlignment = await readFile(alignmentPath);
      const originalSubtitles = await readFile(subtitlesPath);
      scenario.mutate(manifest);
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      let narrationCalls = 0;
      let alignmentCalls = 0;
      const { code, output } = await runNarrationForTest({
        cwd,
        manifestPath,
        voiceId: scenario.voiceId,
        dependencies: {
          ...noNetworkDependencies(),
          generateNarration: async () => {
            narrationCalls += 1;
            throw new Error("unexpected narration generation");
          },
          forceAlign: async () => {
            alignmentCalls += 1;
            throw new Error("unexpected alignment");
          },
        },
      });

      assert.equal(code, 2);
      assert.equal(narrationCalls, 0);
      assert.equal(alignmentCalls, 0);
      assert.deepEqual(await readFile(narrationPath), originalAudio);
      assert.deepEqual(await readFile(alignmentPath), originalAlignment);
      assert.deepEqual(await readFile(subtitlesPath), originalSubtitles);
      assert.match(
        output.stderr.join("\n"),
        /replacement.*confirm-elevenlabs-replacement/i,
      );
      const report = JSON.parse(
        await readFile(path.join(directory, "generation-report.json"), "utf8"),
      );
      assert.equal(report.narration.status, "stale");

      const verification = outputCollector();
      assert.equal(
        await runCli(["verify-assets", "--manifest", manifestPath], {
          cwd,
          dependencies: noNetworkDependencies(),
          ...verification,
        }),
        1,
      );
      assert.match(
        verification.stderr.join("\n"),
        /narration.*(fingerprint|identity|stale)/i,
      );
    });
  }
});

test("narrate blocks legacy audio without a recorded identity", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const directory = path.join(cwd, "social-video-assets", manifest.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "narration.mp3"), "legacy audio");
  await writeFile(
    path.join(directory, "generation-report.json"),
    JSON.stringify({ narration: { status: "complete" } }),
  );
  let narrationCalls = 0;
  let alignmentCalls = 0;
  const { code, output } = await runNarrationForTest({
    cwd,
    manifestPath,
    dependencies: {
      ...noNetworkDependencies(),
      generateNarration: async () => {
        narrationCalls += 1;
      },
      forceAlign: async () => {
        alignmentCalls += 1;
      },
    },
  });

  assert.equal(code, 2);
  assert.equal(narrationCalls, 0);
  assert.equal(alignmentCalls, 0);
  assert.equal(await readFile(path.join(directory, "narration.mp3"), "utf8"), "legacy audio");
  assert.match(output.stderr.join("\n"), /replacement/i);
  const report = JSON.parse(
    await readFile(path.join(directory, "generation-report.json"), "utf8"),
  );
  assert.equal(report.narration.status, "stale");
});

test("matching narration identity rebuilds stale alignment only", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const directory = await writeCompleteFlowHandoff(cwd, manifest);
  const reportPath = path.join(directory, "generation-report.json");
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  report.narration.alignmentSourceFingerprint = "stale-alignment";
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  const originalAudio = await readFile(path.join(directory, "narration.mp3"));
  let narrationCalls = 0;
  let alignmentCalls = 0;
  const { code } = await runNarrationForTest({
    cwd,
    manifestPath,
    dependencies: {
      ...noNetworkDependencies(),
      generateNarration: async () => {
        narrationCalls += 1;
        throw new Error("unexpected narration generation");
      },
      forceAlign: async () => {
        alignmentCalls += 1;
        return {
          words: [{ text: "Refreshed", start: 0, end: 0.5 }],
          characters: [],
          loss: 0.01,
        };
      },
    },
  });

  assert.equal(code, 0);
  assert.equal(narrationCalls, 0);
  assert.equal(alignmentCalls, 1);
  assert.deepEqual(await readFile(path.join(directory, "narration.mp3")), originalAudio);
  assert.match(
    await readFile(path.join(directory, "subtitles.srt"), "utf8"),
    /Refreshed/,
  );
  const refreshed = JSON.parse(await readFile(reportPath, "utf8"));
  assert.equal(
    refreshed.narration.alignmentSourceFingerprint,
    narrationIdentity(manifest, "voice-123", originalAudio)
      .alignmentSourceFingerprint,
  );
});

test("approved narration replacement refreshes the complete asset chain", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const directory = await writeCompleteFlowHandoff(cwd, manifest);
  manifest.narration = manifest.narration.replace(
    "Protein labels",
    "Nutrition labels",
  );
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  const replacementAudio = Buffer.from("replacement narration audio");
  let narrationCalls = 0;
  let alignmentCalls = 0;
  let narrationTemporaryPath = "";
  let alignmentAudioPath = "";
  const { code } = await runNarrationForTest({
    cwd,
    manifestPath,
    voiceId: "voice-456",
    replacement: true,
    dependencies: {
      ...noNetworkDependencies(),
      generateNarration: async ({ outputPath }) => {
        narrationCalls += 1;
        narrationTemporaryPath = outputPath;
        await writeFile(outputPath, replacementAudio);
        return {
          outputPath,
          bytes: replacementAudio.length,
          characterCost: 130,
          requestId: "replacement-request",
        };
      },
      forceAlign: async ({ audioPath }) => {
        alignmentCalls += 1;
        alignmentAudioPath = audioPath;
        assert.deepEqual(await readFile(audioPath), replacementAudio);
        return {
          words: [{ text: "Replacement", start: 0, end: 0.5 }],
          characters: [],
          loss: 0.01,
        };
      },
    },
  });

  assert.equal(code, 0);
  assert.equal(narrationCalls, 1);
  assert.equal(alignmentCalls, 1);
  assert.match(narrationTemporaryPath, /\.tmp$/);
  assert.equal(alignmentAudioPath, narrationTemporaryPath);
  assert.deepEqual(
    await readFile(path.join(directory, "narration.mp3")),
    replacementAudio,
  );
  assert.match(
    await readFile(path.join(directory, "subtitles.srt"), "utf8"),
    /Replacement/,
  );
  const report = JSON.parse(
    await readFile(path.join(directory, "generation-report.json"), "utf8"),
  );
  assert.deepEqual(
    {
      voiceId: report.narration.voiceId,
      inputFingerprint: report.narration.inputFingerprint,
      audioFingerprint: report.narration.audioFingerprint,
      alignmentSourceFingerprint:
        report.narration.alignmentSourceFingerprint,
    },
    narrationIdentity(manifest, "voice-456", replacementAudio),
  );

  const verification = outputCollector();
  assert.equal(
    await runCli(["verify-assets", "--manifest", manifestPath], {
      cwd,
      dependencies: noNetworkDependencies(),
      ...verification,
    }),
    0,
  );
  assert.deepEqual(verification.stderr, []);
});

test("failed approved replacement preserves final generated assets", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const directory = await writeCompleteFlowHandoff(cwd, manifest);
  const narrationPath = path.join(directory, "narration.mp3");
  const alignmentPath = path.join(directory, "alignment.json");
  const subtitlesPath = path.join(directory, "subtitles.srt");
  const originalAudio = await readFile(narrationPath);
  const originalAlignment = await readFile(alignmentPath);
  const originalSubtitles = await readFile(subtitlesPath);
  let narrationCalls = 0;
  let alignmentCalls = 0;
  const { code } = await runNarrationForTest({
    cwd,
    manifestPath,
    voiceId: "voice-456",
    replacement: true,
    dependencies: {
      ...noNetworkDependencies(),
      generateNarration: async ({ outputPath }) => {
        narrationCalls += 1;
        await writeFile(outputPath, "temporary replacement");
        return { outputPath, bytes: 21, characterCost: 130 };
      },
      forceAlign: async () => {
        alignmentCalls += 1;
        throw new Error("alignment failed");
      },
    },
  });

  assert.equal(code, 1);
  assert.equal(narrationCalls, 1);
  assert.equal(alignmentCalls, 1);
  assert.deepEqual(await readFile(narrationPath), originalAudio);
  assert.deepEqual(await readFile(alignmentPath), originalAlignment);
  assert.deepEqual(await readFile(subtitlesPath), originalSubtitles);
  const report = JSON.parse(
    await readFile(path.join(directory, "generation-report.json"), "utf8"),
  );
  assert.equal(report.narration.status, "failed");
});

test("narration replacement confirmation also requires generation confirmation", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  await writeCompleteFlowHandoff(cwd, manifest);
  const { code, output } = await runNarrationForTest({
    cwd,
    manifestPath,
    replacement: true,
    confirmGeneration: false,
  });

  assert.equal(code, 2);
  assert.match(output.stderr.join("\n"), /confirm-elevenlabs-generation/);
});

test("verify-assets reports missing handoff files", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const output = outputCollector();

  const code = await runCli(["verify-assets", "--manifest", manifestPath], {
    cwd,
    dependencies: noNetworkDependencies(),
    ...output,
  });

  assert.equal(code, 1);
  assert.match(output.stderr.join("\n"), /brief\.md is missing/);
  assert.match(output.stderr.join("\n"), /shots\/shot-01\.mp4 is missing/);
});

test("verify-assets accepts an editor-ready Flow handoff", async () => {
  const manifest = makeFlowManifest();
  const { cwd, manifestPath } = await setupManifest(manifest);
  const directory = await writeCompleteFlowHandoff(cwd, manifest);
  const output = outputCollector();

  const code = await runCli(["verify-assets", "--manifest", manifestPath], {
    cwd,
    dependencies: noNetworkDependencies(),
    ...output,
  });

  assert.equal(code, 0);
  assert.deepEqual(output.stderr, []);
  assert.match(output.stdout.join("\n"), /Asset package valid:/);
  assert.match(output.stdout.join("\n"), new RegExp(directory));
});
