import { createHash } from "node:crypto";
import path from "node:path";

import { getVideoConfiguration, validateManifest } from "./manifest.mjs";

export function fingerprintPrompt(prompt) {
  const normalized = String(prompt).trim().replace(/\s+/gu, " ");
  return createHash("sha256").update(normalized).digest("hex");
}

export function createFlowRun({
  manifest: manifestInput,
  outputDirectory,
  existingRun = null,
  resetChangedShotIds = [],
  approvedResetShotIds = resetChangedShotIds,
  now = new Date().toISOString(),
}) {
  const manifest = validateManifest(manifestInput);
  const video = getVideoConfiguration(manifest);
  if (video.provider !== "flow-browser") {
    throw new Error("prepare-flow requires a flow-browser manifest");
  }

  const resetIds = new Set(approvedResetShotIds);
  const existingById = new Map((existingRun?.shots ?? []).map((shot) => [shot.id, shot]));
  const changed = [];
  const invalidRetries = [];
  const shots = manifest.shots.map((shot) => {
    const promptFingerprint = fingerprintPrompt(shot.prompt);
    const existing = existingById.get(shot.id);
    const promptChanged = existing && existing.promptFingerprint !== promptFingerprint;
    const resetApproved = resetIds.has(shot.id);
    if (promptChanged && !resetApproved) changed.push(shot.id);
    if (resetApproved && !promptChanged && existing?.status !== "failed") {
      invalidRetries.push({ id: shot.id, status: existing?.status ?? "missing" });
    }

    if (existing && !promptChanged && !resetApproved) {
      return { ...existing, title: shot.title, promptFingerprint, updatedAt: now };
    }

    return {
      id: shot.id,
      title: shot.title,
      status: "pending",
      promptFingerprint,
      attempts: existing?.attempts ?? 0,
      flowProjectUrl: existing?.flowProjectUrl ?? null,
      downloadedFilename: null,
      outputPath: path.join(outputDirectory, "shots", `shot-${String(shot.id).padStart(2, "0")}.mp4`),
      bytes: null,
      error: null,
      replacementApproved: Boolean(existing && resetApproved),
      updatedAt: now,
    };
  });

  if (changed.length > 0) {
    throw new Error(`Changed prompt requires approved reset for shot ${changed.join(", ")}`);
  }
  if (invalidRetries.length > 0) {
    throw new Error(
      invalidRetries
        .map(({ id, status }) => `Shot ${id} is ${status} and cannot be retried`)
        .join("; "),
    );
  }

  return {
    version: 1,
    provider: "flow-browser",
    articleUrl: manifest.articleUrl,
    slug: manifest.slug,
    video,
    startedAt: existingRun?.startedAt ?? now,
    updatedAt: now,
    shots,
  };
}
