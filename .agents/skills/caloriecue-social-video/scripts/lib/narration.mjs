import { createHash } from "node:crypto";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function fingerprintJson(value) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

export function fingerprintBytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function fingerprintNarrationInput({
  text,
  voiceId,
  modelId,
  outputFormat,
  voiceSettings = {},
}) {
  return fingerprintJson({
    text,
    voiceId,
    modelId,
    outputFormat,
    voiceSettings,
  });
}

export function fingerprintAlignmentSource({
  text,
  narrationInputFingerprint,
  audioFingerprint,
}) {
  return fingerprintJson({
    text,
    narrationInputFingerprint,
    audioFingerprint,
  });
}
