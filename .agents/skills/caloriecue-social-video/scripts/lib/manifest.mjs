export const VEO_PRICES_PER_SECOND = Object.freeze({
  "veo-3.1-lite-generate-preview": Object.freeze({
    "720p": 0.05,
    "1080p": 0.08,
  }),
  "veo-3.1-fast-generate-preview": Object.freeze({
    "720p": 0.1,
    "1080p": 0.12,
    "4k": 0.3,
  }),
  "veo-3.1-generate-preview": Object.freeze({
    "720p": 0.4,
    "1080p": 0.4,
    "4k": 0.6,
  }),
});

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_DURATIONS = new Set([4, 6, 8]);

export class ManifestValidationError extends Error {
  constructor(problems) {
    super("Invalid social-video manifest:\n- " + problems.join("\n- "));
    this.name = "ManifestValidationError";
    this.problems = problems;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function countWords(value) {
  if (!isNonEmptyString(value)) {
    return 0;
  }

  return value.trim().split(/\s+/u).length;
}

function validateArticleUrl(value, problems) {
  if (!isNonEmptyString(value)) {
    problems.push("articleUrl is required");
    return;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (
      url.protocol !== "https:" ||
      !["caloriecue.app", "www.caloriecue.app"].includes(hostname) ||
      pathParts.length !== 2 ||
      pathParts[0] !== "blog" ||
      !SLUG_PATTERN.test(pathParts[1])
    ) {
      problems.push("articleUrl must be a caloriecue.app blog URL");
    }
  } catch {
    problems.push("articleUrl must be a caloriecue.app blog URL");
  }
}

function validateVeo(value, problems) {
  if (!isRecord(value)) {
    problems.push("veo must be an object");
    return;
  }

  const prices = VEO_PRICES_PER_SECOND[value.model];
  if (!prices) {
    problems.push("veo.model is not a supported Veo 3.1 model");
  }

  if (value.aspectRatio !== "9:16") {
    problems.push('veo.aspectRatio must be "9:16"');
  }

  if (!prices?.[value.resolution]) {
    problems.push(
      "veo.resolution is not supported by the selected Veo model",
    );
  }

  if (!VALID_DURATIONS.has(value.durationSeconds)) {
    problems.push("veo.durationSeconds must be 4, 6, or 8");
  }

  if (
    ["1080p", "4k"].includes(value.resolution) &&
    value.durationSeconds !== 8
  ) {
    problems.push(
      "veo.durationSeconds must be 8 for 1080p or 4k generation",
    );
  }
}

function validateElevenLabs(value, problems) {
  if (!isRecord(value)) {
    problems.push("elevenlabs must be an object");
    return;
  }

  if (!isNonEmptyString(value.modelId)) {
    problems.push("elevenlabs.modelId is required");
  }

  if (value.outputFormat !== "mp3_44100_128") {
    problems.push(
      'elevenlabs.outputFormat must be "mp3_44100_128" for version 1',
    );
  }

  if (!isRecord(value.voiceSettings)) {
    problems.push("elevenlabs.voiceSettings must be an object");
  }
}

function validateSocialCopy(value, problems) {
  if (!isRecord(value)) {
    problems.push("socialCopy must be an object");
    return;
  }

  for (const platform of ["instagram", "tiktok", "facebook"]) {
    if (!isNonEmptyString(value[platform])) {
      problems.push("socialCopy." + platform + " is required");
    }
  }

  if (
    !Array.isArray(value.hashtags) ||
    value.hashtags.length === 0 ||
    value.hashtags.some((tag) => !isNonEmptyString(tag))
  ) {
    problems.push("socialCopy.hashtags must contain at least one hashtag");
  }
}

function validateShots(value, veo, targetDurationSeconds, problems) {
  if (!Array.isArray(value) || value.length === 0) {
    problems.push("shots must contain at least one shot");
    return;
  }

  const ids = [];
  for (const [index, shot] of value.entries()) {
    if (!isRecord(shot)) {
      problems.push("shots[" + index + "] must be an object");
      continue;
    }

    if (!Number.isInteger(shot.id) || shot.id <= 0) {
      problems.push("shots[" + index + "].id must be a positive integer");
    } else {
      ids.push(shot.id);
    }

    if (!isNonEmptyString(shot.title)) {
      problems.push("shots[" + index + "].title is required");
    }

    if (!isNonEmptyString(shot.purpose)) {
      problems.push("shots[" + index + "].purpose is required");
    }

    if (!isNonEmptyString(shot.prompt) || shot.prompt.trim().length < 40) {
      problems.push(
        "shots[" + index + "].prompt must contain at least 40 characters",
      );
    }
  }

  if (new Set(ids).size !== ids.length) {
    problems.push("shot IDs must be unique");
  }

  if (
    isRecord(veo) &&
    VALID_DURATIONS.has(veo.durationSeconds) &&
    Number.isFinite(targetDurationSeconds)
  ) {
    const footageSeconds = value.length * veo.durationSeconds;
    if (footageSeconds < targetDurationSeconds) {
      problems.push(
        "shots do not provide enough footage for targetDurationSeconds",
      );
    }
  }
}

export function validateManifest(input) {
  const problems = [];

  if (!isRecord(input)) {
    throw new ManifestValidationError(["manifest must be a JSON object"]);
  }

  if (input.version !== 1) {
    problems.push("version must be 1");
  }

  validateArticleUrl(input.articleUrl, problems);

  if (!isNonEmptyString(input.slug) || !SLUG_PATTERN.test(input.slug)) {
    problems.push("slug must use lowercase hyphen-case");
  }

  if (
    !Number.isFinite(input.targetDurationSeconds) ||
    input.targetDurationSeconds < 60 ||
    input.targetDurationSeconds > 75
  ) {
    problems.push("targetDurationSeconds must be between 60 and 75");
  }

  if (!isNonEmptyString(input.narration)) {
    problems.push("narration is required");
  } else if (Number.isFinite(input.targetDurationSeconds)) {
    const words = countWords(input.narration);
    const minimumWords = Math.floor(
      (input.targetDurationSeconds / 60) * 120,
    );
    const maximumWords = Math.ceil(
      (input.targetDurationSeconds / 60) * 165,
    );
    if (words < minimumWords || words > maximumWords) {
      problems.push(
        "narration word count " +
          words +
          " is outside the expected " +
          minimumWords +
          "–" +
          maximumWords +
          " words for the target duration",
      );
    }
  }

  validateSocialCopy(input.socialCopy, problems);
  validateVeo(input.veo, problems);
  validateElevenLabs(input.elevenlabs, problems);
  validateShots(
    input.shots,
    input.veo,
    input.targetDurationSeconds,
    problems,
  );

  if (problems.length > 0) {
    throw new ManifestValidationError(problems);
  }

  return structuredClone(input);
}

export function normalizeShotSelection(manifestInput, selection) {
  const manifest = validateManifest(manifestInput);
  const availableIds = new Set(manifest.shots.map((shot) => shot.id));

  if (
    selection === undefined ||
    selection === null ||
    selection === "" ||
    (Array.isArray(selection) && selection.length === 0)
  ) {
    return manifest.shots.map((shot) => shot.id);
  }

  const rawIds = Array.isArray(selection)
    ? selection
    : String(selection).split(",");
  const ids = [];

  for (const rawId of rawIds) {
    const id = Number(String(rawId).trim());
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("invalid shot ID " + rawId);
    }
    if (!availableIds.has(id)) {
      throw new Error("unknown shot ID " + id);
    }
    if (!ids.includes(id)) {
      ids.push(id);
    }
  }

  return ids;
}

export function estimateVeoCost(manifestInput, selectedShotIds) {
  const manifest = validateManifest(manifestInput);
  const ids = normalizeShotSelection(manifest, selectedShotIds);
  const rate =
    VEO_PRICES_PER_SECOND[manifest.veo.model][manifest.veo.resolution];
  const estimate = ids.length * manifest.veo.durationSeconds * rate;

  return Math.round((estimate + Number.EPSILON) * 100) / 100;
}
