import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

function redact(value, secrets = []) {
  let result = String(value);
  for (const secret of secrets) {
    if (typeof secret === "string" && secret.length > 0) {
      result = result.split(secret).join("[REDACTED]");
    }
  }
  return result;
}

function providerMessage(body, fallback) {
  if (typeof body?.detail === "string") {
    return body.detail;
  }
  if (typeof body?.detail?.message === "string") {
    return body.detail.message;
  }
  if (typeof body?.message === "string") {
    return body.message;
  }
  return fallback;
}

async function apiError(response, service, secrets) {
  let message = response.status + " " + response.statusText;
  try {
    const body = await response.json();
    message = providerMessage(body, message);
  } catch {
    // Preserve the HTTP status when the response is not JSON.
  }
  return new Error(
    service + " request failed: " + redact(message, secrets),
  );
}

function mapVoiceSettings(value = {}) {
  const mapped = {};
  const pairs = [
    ["stability", "stability"],
    ["similarityBoost", "similarity_boost"],
    ["style", "style"],
    ["useSpeakerBoost", "use_speaker_boost"],
    ["speed", "speed"],
  ];

  for (const [source, destination] of pairs) {
    if (value[source] !== undefined) {
      mapped[destination] = value[source];
    }
  }
  return mapped;
}

export async function generateNarration({
  apiKey,
  voiceId,
  text,
  modelId,
  outputFormat = "mp3_44100_128",
  voiceSettings = {},
  outputPath,
  fetchImpl = globalThis.fetch,
  baseUrl = ELEVENLABS_BASE_URL,
}) {
  const url =
    baseUrl +
    "/text-to-speech/" +
    encodeURIComponent(voiceId) +
    "?output_format=" +
    encodeURIComponent(outputFormat);
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: mapVoiceSettings(voiceSettings),
    }),
  });

  if (!response.ok) {
    throw await apiError(response, "ElevenLabs narration", [apiKey]);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);

  const characterCostValue = response.headers.get("character-cost");
  const characterCost =
    characterCostValue === null ? null : Number(characterCostValue);

  return {
    outputPath,
    bytes: bytes.length,
    characterCost:
      characterCost !== null && Number.isFinite(characterCost)
        ? characterCost
        : null,
    requestId: response.headers.get("request-id"),
  };
}

export async function forceAlign({
  apiKey,
  audioPath,
  text,
  fetchImpl = globalThis.fetch,
  baseUrl = ELEVENLABS_BASE_URL,
}) {
  const audioBytes = await readFile(audioPath);
  const form = new FormData();
  form.append(
    "file",
    new Blob([audioBytes], { type: "audio/mpeg" }),
    path.basename(audioPath),
  );
  form.append("text", text);

  const response = await fetchImpl(baseUrl + "/forced-alignment", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    throw await apiError(response, "ElevenLabs forced alignment", [
      apiKey,
    ]);
  }

  const alignment = await response.json();
  if (!Array.isArray(alignment?.words)) {
    throw new Error(
      "ElevenLabs forced alignment returned no timed words",
    );
  }
  return alignment;
}

export async function getElevenLabsVoice({
  apiKey,
  voiceId,
  fetchImpl = globalThis.fetch,
  baseUrl = ELEVENLABS_BASE_URL,
}) {
  const response = await fetchImpl(
    baseUrl + "/voices/" + encodeURIComponent(voiceId),
    {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    },
  );

  if (!response.ok) {
    throw await apiError(response, "ElevenLabs voice check", [apiKey]);
  }

  const voice = await response.json();
  if (!voice?.voice_id || !voice?.name) {
    throw new Error("ElevenLabs voice check returned incomplete metadata");
  }
  return voice;
}
