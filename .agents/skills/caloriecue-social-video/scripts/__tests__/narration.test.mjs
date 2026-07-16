import assert from "node:assert/strict";
import test from "node:test";

import {
  fingerprintAlignmentSource,
  fingerprintBytes,
  fingerprintNarrationInput,
} from "../lib/narration.mjs";

function narrationInput(overrides = {}) {
  return {
    text: "Exact approved narration.\n",
    voiceId: "voice-123",
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    voiceSettings: {
      stability: 0.55,
      similarityBoost: 0.75,
      useSpeakerBoost: true,
    },
    ...overrides,
  };
}

test("narration input fingerprint is canonical but exact-input sensitive", () => {
  const baseline = fingerprintNarrationInput(narrationInput());
  const reordered = fingerprintNarrationInput(
    narrationInput({
      voiceSettings: {
        useSpeakerBoost: true,
        similarityBoost: 0.75,
        stability: 0.55,
      },
    }),
  );

  assert.equal(baseline.length, 64);
  assert.equal(reordered, baseline);
  for (const changed of [
    narrationInput({ text: "Exact approved narration." }),
    narrationInput({ voiceId: "voice-456" }),
    narrationInput({ modelId: "eleven_v3" }),
    narrationInput({ voiceSettings: { stability: 0.7 } }),
  ]) {
    assert.notEqual(fingerprintNarrationInput(changed), baseline);
  }
});

test("alignment source fingerprint binds exact text, narration identity, and audio bytes", () => {
  const inputFingerprint = fingerprintNarrationInput(narrationInput());
  const audioFingerprint = fingerprintBytes(Buffer.from("audio-one"));
  const baseline = fingerprintAlignmentSource({
    text: narrationInput().text,
    narrationInputFingerprint: inputFingerprint,
    audioFingerprint,
  });

  assert.equal(baseline.length, 64);
  assert.notEqual(
    fingerprintAlignmentSource({
      text: "Exact approved narration.",
      narrationInputFingerprint: inputFingerprint,
      audioFingerprint,
    }),
    baseline,
  );
  assert.notEqual(
    fingerprintAlignmentSource({
      text: narrationInput().text,
      narrationInputFingerprint: inputFingerprint,
      audioFingerprint: fingerprintBytes(Buffer.from("audio-two")),
    }),
    baseline,
  );
});
