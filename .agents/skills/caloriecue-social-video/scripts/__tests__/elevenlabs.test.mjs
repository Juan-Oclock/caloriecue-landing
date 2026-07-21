import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  forceAlign,
  generateNarration,
  getElevenLabsVoice,
} from "../lib/elevenlabs.mjs";

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

test("generates narration with the selected account voice and settings", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "caloriecue-elevenlabs-"),
  );
  const outputPath = path.join(directory, "narration.mp3");
  const calls = [];

  const result = await generateNarration({
    apiKey: "eleven-test-key",
    voiceId: "voice-123",
    text: "Warm, confident wellness narration.",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    voiceSettings: {
      stability: 0.55,
      similarityBoost: 0.75,
      style: 0.15,
      useSpeakerBoost: true,
    },
    outputPath,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(Buffer.from("mp3-bytes"), {
        status: 200,
        headers: {
          "character-cost": "37",
          "request-id": "request-123",
        },
      });
    },
  });

  assert.equal(
    calls[0].url,
    "https://api.elevenlabs.io/v1/text-to-speech/voice-123?output_format=mp3_44100_128",
  );
  assert.equal(calls[0].options.headers["xi-api-key"], "eleven-test-key");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    text: "Warm, confident wellness narration.",
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.15,
      use_speaker_boost: true,
    },
  });
  assert.equal(await readFile(outputPath, "utf8"), "mp3-bytes");
  assert.deepEqual(result, {
    outputPath,
    bytes: 9,
    characterCost: 37,
    requestId: "request-123",
  });
});

test("sends narration audio and exact text to forced alignment", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "caloriecue-alignment-"),
  );
  const audioPath = path.join(directory, "narration.mp3");
  await writeFile(audioPath, Buffer.from("audio"));
  const calls = [];
  const expected = {
    words: [{ text: "Protein", start: 0, end: 0.5 }],
    characters: [],
    loss: 0.02,
  };

  const result = await forceAlign({
    apiKey: "eleven-test-key",
    audioPath,
    text: "Protein",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse(expected);
    },
  });

  assert.equal(
    calls[0].url,
    "https://api.elevenlabs.io/v1/forced-alignment",
  );
  assert.equal(calls[0].options.headers["xi-api-key"], "eleven-test-key");
  assert.equal(calls[0].options.body.get("text"), "Protein");
  assert.equal(calls[0].options.body.get("file").name, "narration.mp3");
  assert.deepEqual(result, expected);
});

test("redacts the ElevenLabs API key from provider errors", async () => {
  const secret = "eleven-super-secret";
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "caloriecue-eleven-error-"),
  );

  await assert.rejects(
    () =>
      generateNarration({
        apiKey: secret,
        voiceId: "voice-123",
        text: "Narration",
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
        voiceSettings: {},
        outputPath: path.join(directory, "narration.mp3"),
        fetchImpl: async () =>
          jsonResponse(
            { detail: { message: "Invalid key " + secret } },
            { status: 401 },
          ),
      }),
    (error) => {
      assert.match(error.message, /Invalid key/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    },
  );
});

test("checks voice access without generating audio", async () => {
  const calls = [];
  const voice = await getElevenLabsVoice({
    apiKey: "eleven-test-key",
    voiceId: "voice-123",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({
        voice_id: "voice-123",
        name: "CalorieCue Educator",
      });
    },
  });

  assert.equal(
    calls[0].url,
    "https://api.elevenlabs.io/v1/voices/voice-123",
  );
  assert.equal(calls[0].options.method, "GET");
  assert.equal(calls[0].options.headers["xi-api-key"], "eleven-test-key");
  assert.equal(voice.name, "CalorieCue Educator");
});
