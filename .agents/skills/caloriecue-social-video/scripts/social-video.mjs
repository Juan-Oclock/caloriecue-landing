#!/usr/bin/env node

import {
  access,
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  downloadVeoVideo,
  getVeoVideoUri,
  listVeoModels,
  pollVeoOperation,
  submitVeoShot,
} from "./lib/gemini.mjs";
import { verifyAssetPackage } from "./lib/assets.mjs";
import {
  forceAlign,
  generateNarration,
  getElevenLabsVoice,
} from "./lib/elevenlabs.mjs";
import { createFlowRun } from "./lib/flow.mjs";
import {
  fingerprintAlignmentSource,
  fingerprintBytes,
  fingerprintNarrationInput,
} from "./lib/narration.mjs";
import {
  estimateVideoUsage,
  estimateVeoCost,
  getVideoConfiguration,
  normalizeShotSelection,
  validateManifest,
} from "./lib/manifest.mjs";
import {
  loadEnvironment,
  missingEnvironmentVariables,
} from "./lib/env.mjs";
import { alignmentToSrt } from "./lib/subtitles.mjs";

const GEMINI_ENVIRONMENT = ["GEMINI_API_KEY"];
const ELEVENLABS_ENVIRONMENT = [
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
];
const BOOLEAN_FLAGS = new Set([
  "confirm-paid-generation",
  "confirm-flow-retry",
  "confirm-elevenlabs-generation",
  "confirm-elevenlabs-replacement",
]);

const DEFAULT_DEPENDENCIES = {
  downloadVeoVideo,
  forceAlign,
  generateNarration,
  getElevenLabsVoice,
  listVeoModels,
  pollVeoOperation,
  submitVeoShot,
};

function parseArguments(argv) {
  const [command, ...tokens] = argv;
  const flags = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) {
      throw new Error("Unexpected argument: " + token);
    }

    const key = token.slice(2);
    if (BOOLEAN_FLAGS.has(key)) {
      flags[key] = true;
      continue;
    }

    const value = tokens[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error("Missing value for --" + key);
    }
    flags[key] = value;
    index += 1;
  }

  return { command, flags };
}

function formatMoney(value) {
  return "$" + Number(value).toFixed(2);
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(manifestPath, cwd) {
  if (!manifestPath) {
    throw new Error("--manifest is required");
  }

  const resolvedPath = path.resolve(cwd, manifestPath);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(resolvedPath, "utf8"));
  } catch (error) {
    throw new Error(
      "Unable to read manifest " +
        resolvedPath +
        ": " +
        error.message,
    );
  }

  return {
    manifest: validateManifest(parsed),
    manifestPath: resolvedPath,
  };
}

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = filePath + ".tmp";
  await writeFile(temporaryPath, JSON.stringify(value, null, 2) + "\n");
  await rename(temporaryPath, filePath);
}

async function readExistingJson(filePath, label) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`Unable to resume ${label}: ${error.message}`);
  }
}

function socialCopyMarkdown(socialCopy) {
  return [
    "# Instagram",
    "",
    socialCopy.instagram,
    "",
    "# TikTok",
    "",
    socialCopy.tiktok,
    "",
    "# Facebook",
    "",
    socialCopy.facebook,
    "",
    "# Hashtags",
    "",
    socialCopy.hashtags.join(" "),
    "",
  ].join("\n");
}

async function writeCreativeFiles(outputDirectory, manifest) {
  await mkdir(path.join(outputDirectory, "shots"), { recursive: true });
  await writeJsonAtomic(
    path.join(outputDirectory, "manifest.json"),
    manifest,
  );
  await writeFile(
    path.join(outputDirectory, "narration-script.txt"),
    manifest.narration.trim() + "\n",
  );
  await writeFile(
    path.join(outputDirectory, "social-copy.md"),
    socialCopyMarkdown(manifest.socialCopy),
  );
}

async function runPrepareFlow({ cwd, flags, writeOut }) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  if (flags["confirm-flow-retry"] && !flags.shots) {
    throw new Error("--confirm-flow-retry requires explicit --shots IDs");
  }
  const outputDirectory = path.join(
    cwd,
    "social-video-assets",
    manifest.slug,
  );
  const runPath = path.join(outputDirectory, "flow-run.json");
  const existingRun = await readExistingJson(runPath, "Flow run");
  const approvedResetShotIds = flags["confirm-flow-retry"]
    ? normalizeShotSelection(manifest, flags.shots)
    : [];
  const run = createFlowRun({
    manifest,
    outputDirectory,
    existingRun,
    approvedResetShotIds,
  });
  await writeCreativeFiles(outputDirectory, manifest);
  await writeJsonAtomic(runPath, run);
  writeOut(`Flow queue prepared: ${runPath}`);
  return 0;
}

async function runVerifyAssets({ cwd, flags, writeOut, writeError }) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  const outputDirectory = path.join(
    cwd,
    "social-video-assets",
    manifest.slug,
  );
  const result = await verifyAssetPackage({ manifest, outputDirectory });
  if (!result.valid) {
    for (const problem of result.problems) writeError(problem);
    return 1;
  }
  writeOut(`Asset package valid: ${outputDirectory}`);
  return 0;
}

function makeShotRecord(shot, outputDirectory, existing) {
  const outputPath = path.join(
    outputDirectory,
    "shots",
    "shot-" + String(shot.id).padStart(2, "0") + ".mp4",
  );
  return {
    id: shot.id,
    title: shot.title,
    status: existing?.status || "pending",
    operationName: existing?.operationName || null,
    outputPath,
    bytes: existing?.bytes || null,
    error: null,
  };
}

function makeReport({
  manifest,
  video,
  shotRecords,
  estimatedCost,
  approvedBudget,
  existingReport,
}) {
  const now = new Date().toISOString();
  return {
    version: 1,
    articleUrl: manifest.articleUrl,
    slug: manifest.slug,
    videoProvider: video.provider,
    video,
    estimatedVeoCostUsd: estimatedCost,
    approvedBudgetUsd: approvedBudget,
    startedAt: existingReport?.startedAt || now,
    updatedAt: now,
    shots: shotRecords,
    narration: existingReport?.narration || { status: "pending" },
  };
}

async function saveReport(reportPath, report) {
  report.updatedAt = new Date().toISOString();
  await writeJsonAtomic(reportPath, report);
}

async function runSetupCheck({
  provider,
  cwd,
  env,
  dependencies,
  writeOut,
  writeError,
}) {
  if (!["flow-browser", "gemini-api"].includes(provider)) {
    writeError('Setup provider must be "flow-browser" or "gemini-api".');
    return 2;
  }
  const loaded = await loadEnvironment({ cwd, env });
  const required = provider === "gemini-api"
    ? [...GEMINI_ENVIRONMENT, ...ELEVENLABS_ENVIRONMENT]
    : ELEVENLABS_ENVIRONMENT;
  const missing = missingEnvironmentVariables(loaded, required);
  let checkFailed = false;

  if (provider === "gemini-api" && loaded.GEMINI_API_KEY) {
    try {
      const models = await dependencies.listVeoModels({
        apiKey: loaded.GEMINI_API_KEY,
      });
      writeOut(
        "Available Veo 3.1 models: " +
          (models.length > 0
            ? models.join(", ")
            : "none reported"),
      );
      checkFailed = models.length === 0;
    } catch (error) {
      writeError(
        "Gemini setup check failed: " +
          String(error.message || error),
      );
      checkFailed = true;
    }
  } else if (provider === "flow-browser") {
    writeOut("Flow authentication: verify the signed-in session in Chrome");
  }

  if (
    loaded.ELEVENLABS_API_KEY &&
    loaded.ELEVENLABS_VOICE_ID
  ) {
    try {
      const voice = await dependencies.getElevenLabsVoice({
        apiKey: loaded.ELEVENLABS_API_KEY,
        voiceId: loaded.ELEVENLABS_VOICE_ID,
      });
      writeOut(
        "ElevenLabs voice: " +
          voice.name +
          " (" +
          voice.voice_id +
          ")",
      );
    } catch (error) {
      writeError(
        "ElevenLabs setup check failed: " +
          String(error.message || error),
      );
      checkFailed = true;
    }
  }

  if (missing.length > 0) {
    writeError(
      "Missing environment variables: " + missing.join(", "),
    );
    return 2;
  }
  return checkFailed ? 1 : 0;
}

async function runGeneration({
  cwd,
  env,
  flags,
  dependencies,
  writeOut,
  writeError,
}) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  const video = getVideoConfiguration(manifest);
  if (video.provider !== "gemini-api") {
    writeError(
      "Gemini API generation requires a gemini-api manifest; this package uses flow-browser.",
    );
    return 2;
  }
  const selectedIds = normalizeShotSelection(manifest, flags.shots);
  const estimatedCost = estimateVeoCost(manifest, selectedIds);

  if (!flags["confirm-paid-generation"]) {
    writeError(
      "Paid generation blocked. Add --confirm-paid-generation only after explicit user approval.",
    );
    return 2;
  }

  const approvedBudget = Number(flags["budget-usd"]);
  if (!Number.isFinite(approvedBudget) || approvedBudget <= 0) {
    writeError(
      "Paid generation blocked. --budget-usd must be a positive approved amount.",
    );
    return 2;
  }

  if (estimatedCost > approvedBudget) {
    writeError(
      "Paid generation blocked. Estimated Veo cost " +
        formatMoney(estimatedCost) +
        " exceeds approved budget " +
        formatMoney(approvedBudget) +
        ".",
    );
    return 2;
  }

  const loaded = await loadEnvironment({ cwd, env });
  const missing = missingEnvironmentVariables(
    loaded,
    GEMINI_ENVIRONMENT,
  );
  if (missing.length > 0) {
    writeError(
      "Missing environment variables: " + missing.join(", "),
    );
    return 2;
  }

  const outputDirectory = path.join(
    cwd,
    "social-video-assets",
    manifest.slug,
  );
  const reportPath = path.join(
    outputDirectory,
    "generation-report.json",
  );
  await writeCreativeFiles(outputDirectory, manifest);

  const existingReport = await readExistingJson(
    reportPath,
    "generation report",
  );
  const existingById = new Map(
    (existingReport?.shots || []).map((shot) => [shot.id, shot]),
  );
  const shotsById = new Map(
    manifest.shots.map((shot) => [shot.id, shot]),
  );
  const explicitSelection =
    typeof flags.shots === "string" && flags.shots.trim().length > 0;
  const selectedShotRecords = selectedIds.map((id) =>
    makeShotRecord(
      shotsById.get(id),
      outputDirectory,
      existingById.get(id),
    ),
  );
  const preservedShotRecords = (existingReport?.shots || []).filter(
    (shot) => !selectedIds.includes(shot.id),
  );
  const shotRecords = [
    ...preservedShotRecords,
    ...selectedShotRecords,
  ].sort((left, right) => left.id - right.id);
  const report = makeReport({
    manifest,
    video,
    shotRecords,
    estimatedCost,
    approvedBudget,
    existingReport,
  });

  for (const record of selectedShotRecords) {
    const shot = shotsById.get(record.id);
    if (
      !explicitSelection &&
      (record.status === "complete" ||
        (await pathExists(record.outputPath)))
    ) {
      record.status = "complete";
      continue;
    }
    if (
      record.operationName &&
      ["submitted", "polling"].includes(record.status)
    ) {
      continue;
    }

    try {
      const operation = await dependencies.submitVeoShot({
        apiKey: loaded.GEMINI_API_KEY,
        model: video.geminiApi.model,
        prompt: shot.prompt,
        aspectRatio: video.aspectRatio,
        resolution: video.resolution,
        durationSeconds: video.durationSeconds,
      });
      record.operationName = operation.name;
      record.status = "submitted";
      record.error = null;
      await saveReport(reportPath, report);
    } catch (error) {
      record.status = "failed";
      record.error = String(error.message || error);
      await saveReport(reportPath, report);
    }
  }

  for (const record of selectedShotRecords) {
    if (
      !record.operationName ||
      !["submitted", "polling"].includes(record.status)
    ) {
      continue;
    }

    try {
      record.status = "polling";
      await saveReport(reportPath, report);
      const operation = await dependencies.pollVeoOperation({
        apiKey: loaded.GEMINI_API_KEY,
        operationName: record.operationName,
      });
      const videoUri = getVeoVideoUri(operation);
      const downloaded = await dependencies.downloadVeoVideo({
        apiKey: loaded.GEMINI_API_KEY,
        videoUri,
        outputPath: record.outputPath,
      });
      record.status = "complete";
      record.bytes = downloaded.bytes;
      record.error = null;
      record.completedAt = new Date().toISOString();
    } catch (error) {
      record.status = "failed";
      record.error = String(error.message || error);
    }
    await saveReport(reportPath, report);
  }

  await saveReport(reportPath, report);
  const failures = report.shots.filter(
    (shot) => shot.status === "failed",
  ).length;

  writeOut(
    "Asset package: " + outputDirectory,
  );
  writeOut(
    "Veo estimate: " +
      formatMoney(estimatedCost) +
      " within approved " +
      formatMoney(approvedBudget),
  );
  if (failures > 0) {
    writeError(
      failures +
        " generation step(s) failed. Resume from generation-report.json without resubmitting completed shots.",
    );
    return 1;
  }
  return 0;
}

async function removeTemporaryFiles(paths) {
  for (const filePath of paths) {
    try {
      await unlink(filePath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}

async function runNarration({
  cwd,
  env,
  flags,
  dependencies,
  writeOut,
  writeError,
}) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  if (!flags["confirm-elevenlabs-generation"]) {
    writeError(
      "ElevenLabs generation blocked. Add --confirm-elevenlabs-generation only after explicit user approval.",
    );
    return 2;
  }

  const loaded = await loadEnvironment({ cwd, env });
  const missing = missingEnvironmentVariables(
    loaded,
    ELEVENLABS_ENVIRONMENT,
  );
  if (missing.length > 0) {
    writeError(`Missing environment variables: ${missing.join(", ")}`);
    return 2;
  }

  const outputDirectory = path.join(
    cwd,
    "social-video-assets",
    manifest.slug,
  );
  const reportPath = path.join(
    outputDirectory,
    "generation-report.json",
  );
  const report =
    (await readExistingJson(reportPath, "generation report")) ??
    {
      version: 2,
      articleUrl: manifest.articleUrl,
      slug: manifest.slug,
      videoProvider: getVideoConfiguration(manifest).provider,
      shots: [],
      narration: { status: "pending" },
    };
  await writeCreativeFiles(outputDirectory, manifest);

  const narrationPath = path.join(outputDirectory, "narration.mp3");
  const alignmentPath = path.join(outputDirectory, "alignment.json");
  const subtitlesPath = path.join(outputDirectory, "subtitles.srt");
  const narrationTemporaryPath = narrationPath + ".tmp";
  const alignmentTemporaryPath = alignmentPath + ".tmp";
  const subtitlesTemporaryPath = subtitlesPath + ".tmp";
  const temporaryPaths = [
    narrationTemporaryPath,
    alignmentTemporaryPath,
    subtitlesTemporaryPath,
  ];
  const replacementApproved = Boolean(
    flags["confirm-elevenlabs-replacement"],
  );
  const inputFingerprint = fingerprintNarrationInput({
    text: manifest.narration,
    voiceId: loaded.ELEVENLABS_VOICE_ID,
    modelId: manifest.elevenlabs.modelId,
    outputFormat: manifest.elevenlabs.outputFormat,
    voiceSettings: manifest.elevenlabs.voiceSettings,
  });
  const narrationExists = await pathExists(narrationPath);
  let audioFingerprint = null;

  if (narrationExists) {
    audioFingerprint = fingerprintBytes(await readFile(narrationPath));
    const identityMatches =
      report.narration?.voiceId === loaded.ELEVENLABS_VOICE_ID &&
      report.narration?.inputFingerprint === inputFingerprint &&
      report.narration?.audioFingerprint === audioFingerprint;
    if (!identityMatches && !replacementApproved) {
      report.narration = {
        ...report.narration,
        status: "stale",
        error:
          "Existing narration assets do not match the approved narration inputs",
      };
      await saveReport(reportPath, report);
      writeError(
        "ElevenLabs narration replacement blocked. Add --confirm-elevenlabs-replacement only after separate replacement approval.",
      );
      return 2;
    }
  }

  let generatedResult = null;
  let generatedAudioReady = false;
  const shouldGenerate = !narrationExists || replacementApproved;

  try {
    let workingAudioPath = narrationPath;
    if (shouldGenerate) {
      report.narration = {
        ...report.narration,
        status: "generating",
        error: null,
      };
      await saveReport(reportPath, report);
      generatedResult = await dependencies.generateNarration({
        apiKey: loaded.ELEVENLABS_API_KEY,
        voiceId: loaded.ELEVENLABS_VOICE_ID,
        text: manifest.narration,
        modelId: manifest.elevenlabs.modelId,
        outputFormat: manifest.elevenlabs.outputFormat,
        voiceSettings: manifest.elevenlabs.voiceSettings,
        outputPath: narrationTemporaryPath,
      });
      audioFingerprint = fingerprintBytes(
        await readFile(narrationTemporaryPath),
      );
      generatedAudioReady = true;
      workingAudioPath = narrationTemporaryPath;
    }

    const alignmentSourceFingerprint = fingerprintAlignmentSource({
      text: manifest.narration,
      narrationInputFingerprint: inputFingerprint,
      audioFingerprint,
    });
    const alignmentNeedsRefresh =
      shouldGenerate ||
      !(await pathExists(alignmentPath)) ||
      !(await pathExists(subtitlesPath)) ||
      report.narration?.alignmentSourceFingerprint !==
        alignmentSourceFingerprint;

    if (alignmentNeedsRefresh) {
      const alignment = await dependencies.forceAlign({
        apiKey: loaded.ELEVENLABS_API_KEY,
        audioPath: workingAudioPath,
        text: manifest.narration,
      });
      await writeFile(
        alignmentTemporaryPath,
        JSON.stringify(alignment, null, 2) + "\n",
      );
      await writeFile(
        subtitlesTemporaryPath,
        alignmentToSrt(alignment),
      );
      if (shouldGenerate) {
        await rename(narrationTemporaryPath, narrationPath);
      }
      await rename(alignmentTemporaryPath, alignmentPath);
      await rename(subtitlesTemporaryPath, subtitlesPath);
    }

    report.narration = {
      ...report.narration,
      ...(generatedResult ?? {}),
      status: "complete",
      outputPath: narrationPath,
      voiceId: loaded.ELEVENLABS_VOICE_ID,
      inputFingerprint,
      audioFingerprint,
      alignmentSourceFingerprint,
      error: null,
    };
    await saveReport(reportPath, report);
    await removeTemporaryFiles(temporaryPaths);

    writeOut(`Narration assets: ${outputDirectory}`);
    return 0;
  } catch (error) {
    if (
      !narrationExists &&
      generatedAudioReady &&
      (await pathExists(narrationTemporaryPath))
    ) {
      await rename(narrationTemporaryPath, narrationPath);
      report.narration = {
        ...report.narration,
        ...(generatedResult ?? {}),
        outputPath: narrationPath,
        voiceId: loaded.ELEVENLABS_VOICE_ID,
        inputFingerprint,
        audioFingerprint,
      };
    }
    await removeTemporaryFiles(temporaryPaths);
    report.narration = {
      ...report.narration,
      status: "failed",
      error: String(error.message || error),
    };
    await saveReport(reportPath, report);
    writeError(
      `ElevenLabs narration failed: ${String(error.message || error)}`,
    );
    return 1;
  }
}

export async function runCli(
  argv,
  {
    cwd = process.cwd(),
    env = process.env,
    dependencies = DEFAULT_DEPENDENCIES,
    writeOut = (value) => console.log(value),
    writeError = (value) => console.error(value),
  } = {},
) {
  try {
    const { command, flags } = parseArguments(argv);

    if (command === "validate") {
      const { manifest } = await readManifest(flags.manifest, cwd);
      writeOut(
        "Manifest valid: " +
          manifest.slug +
          " (" +
          manifest.shots.length +
          " shots)",
      );
      return 0;
    }

    if (command === "estimate") {
      const { manifest } = await readManifest(flags.manifest, cwd);
      const selectedIds = normalizeShotSelection(
        manifest,
        flags.shots,
      );
      const usage = estimateVideoUsage(manifest, selectedIds);
      if (usage.provider === "flow-browser") {
        writeOut(
          `Estimated Flow usage: ${usage.totalCredits} Flow credits for ${usage.selectedShots} shot(s) / ${usage.outputs} output(s)`,
        );
      } else {
        writeOut(
          `Estimated Veo cost: ${formatMoney(usage.totalUsd)} for ${usage.selectedShots} shot(s)`,
        );
      }
      return 0;
    }

    if (command === "prepare-flow") {
      return await runPrepareFlow({ cwd, flags, writeOut });
    }

    if (command === "check-setup") {
      return await runSetupCheck({
        provider: flags.provider ?? "flow-browser",
        cwd,
        env,
        dependencies,
        writeOut,
        writeError,
      });
    }

    if (command === "generate") {
      return await runGeneration({
        cwd,
        env,
        flags,
        dependencies,
        writeOut,
        writeError,
      });
    }

    if (command === "narrate") {
      return await runNarration({
        cwd,
        env,
        flags,
        dependencies,
        writeOut,
        writeError,
      });
    }

    if (command === "verify-assets") {
      return await runVerifyAssets({
        cwd,
        flags,
        writeOut,
        writeError,
      });
    }

    writeError(
      "Usage: social-video.mjs <validate|estimate|prepare-flow|check-setup|generate|narrate|verify-assets> [options]. Narration replacement: narrate --manifest <path> --confirm-elevenlabs-generation --confirm-elevenlabs-replacement",
    );
    return 2;
  } catch (error) {
    writeError(String(error.message || error));
    return 1;
  }
}

const invokedUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedUrl) {
  const code = await runCli(process.argv.slice(2));
  process.exitCode = code;
}
