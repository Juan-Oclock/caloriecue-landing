import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateVeoCost,
  normalizeShotSelection,
  validateManifest,
} from "../lib/manifest.mjs";

function makeManifest(overrides = {}) {
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
    ...overrides,
  };
}

test("validates and normalizes an eight-shot CalorieCue manifest", () => {
  const result = validateManifest(makeManifest());

  assert.equal(result.slug, "high-protein-low-calorie-foods");
  assert.equal(result.shots.length, 8);
  assert.equal(result.veo.resolution, "1080p");
});

test("estimates eight Fast 1080p shots at USD 7.68", () => {
  assert.equal(estimateVeoCost(makeManifest()), 7.68);
});

test("estimates only explicitly selected shots", () => {
  assert.equal(estimateVeoCost(makeManifest(), [2, 5]), 1.92);
});

test("rejects a non-CalorieCue article URL", () => {
  assert.throws(
    () =>
      validateManifest(
        makeManifest({
          articleUrl: "https://example.com/blog/high-protein",
        }),
      ),
    /articleUrl must be a caloriecue\.app blog URL/,
  );
});

test("rejects unsupported Veo combinations and duplicate shot IDs together", () => {
  const manifest = makeManifest({
    veo: {
      model: "veo-3.1-lite-generate-preview",
      aspectRatio: "1:1",
      resolution: "4k",
      durationSeconds: 7,
    },
    shots: [
      ...makeManifest().shots.slice(0, 7),
      {
        id: 7,
        title: "Duplicate",
        purpose: "Duplicate",
        prompt: "Duplicate prompt",
      },
    ],
  });

  assert.throws(
    () => validateManifest(manifest),
    (error) => {
      assert.match(error.message, /aspectRatio/);
      assert.match(error.message, /resolution/);
      assert.match(error.message, /durationSeconds/);
      assert.match(error.message, /shot IDs must be unique/);
      return true;
    },
  );
});

test("rejects narration that is implausibly short for the target duration", () => {
  assert.throws(
    () => validateManifest(makeManifest({ narration: "Eat more protein." })),
    /narration word count/,
  );
});

test("normalizes a comma-delimited shot selection and rejects unknown IDs", () => {
  const manifest = makeManifest();

  assert.deepEqual(normalizeShotSelection(manifest, "2,5"), [2, 5]);
  assert.throws(
    () => normalizeShotSelection(manifest, "2,9"),
    /unknown shot ID 9/,
  );
});
