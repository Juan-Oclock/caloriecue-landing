import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  downloadVeoVideo,
  listVeoModels,
  pollVeoOperation,
  submitVeoShot,
} from "../lib/gemini.mjs";

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

test("submits the documented Veo 3.1 vertical-video request", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ name: "operations/veo-123", done: false });
  };

  const operation = await submitVeoShot({
    apiKey: "test-key",
    model: "veo-3.1-fast-generate-preview",
    prompt: "Macro food cinematography with natural movement and no text.",
    aspectRatio: "9:16",
    resolution: "1080p",
    durationSeconds: 8,
    fetchImpl,
  });

  assert.equal(operation.name, "operations/veo-123");
  assert.equal(
    calls[0].url,
    "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-fast-generate-preview:predictLongRunning",
  );
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.headers["x-goog-api-key"], "test-key");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    instances: [
      {
        prompt:
          "Macro food cinematography with natural movement and no text.",
      },
    ],
    parameters: {
      aspectRatio: "9:16",
      resolution: "1080p",
      durationSeconds: 8,
      numberOfVideos: 1,
    },
  });
});

test("does not leak the Gemini API key in an API error", async () => {
  const secret = "super-secret-key";
  const fetchImpl = async () =>
    jsonResponse(
      { error: { message: "Invalid API key: " + secret } },
      { status: 403 },
    );

  await assert.rejects(
    () =>
      submitVeoShot({
        apiKey: secret,
        model: "veo-3.1-fast-generate-preview",
        prompt: "Safe prompt",
        aspectRatio: "9:16",
        resolution: "1080p",
        durationSeconds: 8,
        fetchImpl,
      }),
    (error) => {
      assert.match(error.message, /Invalid API key/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    },
  );
});

test("polls the same operation until the video is complete", async () => {
  const calls = [];
  const responses = [
    { name: "operations/veo-123", done: false },
    {
      name: "operations/veo-123",
      done: true,
      response: {
        generateVideoResponse: {
          generatedSamples: [
            { video: { uri: "https://download.example/video.mp4" } },
          ],
        },
      },
    },
  ];

  const operation = await pollVeoOperation({
    apiKey: "test-key",
    operationName: "operations/veo-123",
    pollIntervalMs: 0,
    sleep: async () => {},
    fetchImpl: async (url) => {
      calls.push(url);
      return jsonResponse(responses.shift());
    },
  });

  assert.equal(operation.done, true);
  assert.equal(calls.length, 2);
  assert.ok(calls.every((url) => url.endsWith("/operations/veo-123")));
});

test("downloads video bytes with an authenticated header", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-veo-"));
  const outputPath = path.join(directory, "shots", "shot-01.mp4");
  const calls = [];

  await downloadVeoVideo({
    apiKey: "test-key",
    videoUri: "https://download.example/video.mp4",
    outputPath,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(Buffer.from("video-bytes"), { status: 200 });
    },
  });

  assert.equal(await readFile(outputPath, "utf8"), "video-bytes");
  assert.equal(calls[0].options.headers["x-goog-api-key"], "test-key");
});

test("lists only available Veo 3.1 generation models", async () => {
  const models = await listVeoModels({
    apiKey: "test-key",
    fetchImpl: async () =>
      jsonResponse({
        models: [
          {
            name: "models/veo-3.1-fast-generate-preview",
            supportedGenerationMethods: ["predictLongRunning"],
          },
          {
            name: "models/gemini-3-flash",
            supportedGenerationMethods: ["generateContent"],
          },
        ],
      }),
  });

  assert.deepEqual(models, ["veo-3.1-fast-generate-preview"]);
});
