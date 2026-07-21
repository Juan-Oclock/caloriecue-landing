# CalorieCue Social Video Flow Hybrid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make browser-assisted Google Flow the default Veo provider for new CalorieCue social-video packages while keeping Gemini API generation as an explicit, budget-gated fallback.

**Architecture:** Version 2 manifests describe common video settings plus provider-specific Flow and Gemini configuration, while legacy version 1 manifests retain Gemini API behavior. Pure manifest and Flow-state modules provide deterministic validation, credit estimates, resumable queue state, and asset checks; the CLI prepares local state and narration assets, while the Codex skill controls the signed-in Flow UI through Chrome.

**Tech Stack:** Node.js ESM, `node:test`, ElevenLabs HTTP API, Gemini Veo HTTP API fallback, Codex Chrome control skill, Markdown skill instructions.

## Global Constraints

- `flow-browser` is the default provider for every newly drafted package.
- A legacy version 1 manifest without an explicit provider remains `gemini-api`.
- Flow generation uses the user's Google AI Pro credits and submits no more generated outputs than the approved credit estimate.
- Flow UI interaction occurs through the user's signed-in Chrome session; never store Google credentials or bypass CAPTCHA.
- No Gemini video API call may occur for a `flow-browser` manifest.
- Gemini API generation requires both an explicit `gemini-api` manifest and the existing USD budget confirmation.
- No Flow or Gemini retry occurs without separate approval for the affected shot IDs and added credits or budget.
- ElevenLabs narration requires explicit approval and reads secrets only from the environment or `.env.local`.
- Stop after producing editor-ready assets; do not assemble, upload, or publish the final video.
- Preserve the untracked `video/` directory and all unrelated user files.
- Do not merge or otherwise modify the long-lived `content/draft` branch.

---

## File map

- Modify `.agents/skills/caloriecue-social-video/scripts/lib/manifest.mjs`: validate legacy and provider-aware manifests; expose canonical provider configuration and Flow/API estimates.
- Modify `.agents/skills/caloriecue-social-video/scripts/__tests__/manifest.test.mjs`: prove version compatibility, provider defaults, validation, and estimates.
- Create `.agents/skills/caloriecue-social-video/scripts/__tests__/fixtures/flow-manifest.json`: stable no-spend version 2 CLI fixture.
- Create `.agents/skills/caloriecue-social-video/scripts/lib/flow.mjs`: pure prompt fingerprinting and resumable Flow queue construction.
- Create `.agents/skills/caloriecue-social-video/scripts/__tests__/flow.test.mjs`: prove queue initialization, resume, changed-prompt blocking, retry reset, and secret-free state.
- Modify `.agents/skills/caloriecue-social-video/scripts/social-video.mjs`: add provider-aware setup, `prepare-flow`, `narrate`, and `verify-assets`; keep `generate` API-only.
- Modify `.agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs`: prove command gates and absence of unintended provider calls.
- Create `.agents/skills/caloriecue-social-video/scripts/lib/assets.mjs`: inspect required handoff files without altering them.
- Create `.agents/skills/caloriecue-social-video/scripts/__tests__/assets.test.mjs`: prove missing, empty, and successful asset checks.
- Modify `.agents/skills/caloriecue-social-video/SKILL.md`: make the approval-first Flow browser workflow the default.
- Modify `.agents/skills/caloriecue-social-video/references/creative-package.md`: document the version 2 manifest and Flow-credit approval sheet.
- Create `.agents/skills/caloriecue-social-video/references/flow-browser.md`: document safe Chrome operation, queue reconciliation, downloads, and retry handling.
- Modify `.agents/skills/caloriecue-social-video/agents/openai.yaml`: describe Flow-first behavior in the default prompt.

---

### Task 1: Provider-aware manifest and cost model

**Files:**
- Modify: `.agents/skills/caloriecue-social-video/scripts/lib/manifest.mjs`
- Modify: `.agents/skills/caloriecue-social-video/scripts/__tests__/manifest.test.mjs`
- Create: `.agents/skills/caloriecue-social-video/scripts/__tests__/fixtures/flow-manifest.json`

**Interfaces:**
- Consumes: existing version 1 manifest shape with `veo` and new version 2 shape with `video`, `flow`, and `geminiApi`.
- Produces: `getVideoConfiguration(manifestInput)`, `estimateVideoUsage(manifestInput, selectedShotIds)`, and the existing `validateManifest`, `normalizeShotSelection`, and `estimateVeoCost` APIs.

- [ ] **Step 1: Add failing version 2 and estimate tests**

Create `scripts/__tests__/fixtures/flow-manifest.json` with this complete package:

```json
{
  "version": 2,
  "articleUrl": "https://caloriecue.app/blog/high-protein-low-calorie-foods",
  "slug": "high-protein-low-calorie-foods",
  "targetDurationSeconds": 64,
  "narration": "Protein labels can be misleading when calories matter. The better comparison is protein per one hundred calories, because it shows how efficiently each food supports your target. Shrimp, tuna, cod, egg whites, chicken breast, Greek yogurt, and cottage cheese all deliver useful protein without spending most of your calorie budget. Shrimp provides about twenty three grams of protein per one hundred calories, while tuna and cod are close behind. Peanut butter can still fit a balanced diet, but it is far less protein dense than lean seafood or poultry. Start each meal with a lean protein anchor. Add vegetables or fruit for volume and fiber, then choose carbohydrates and fats that fit your preferences and remaining calories. You do not need perfect meals or a restrictive food list. You need portions you can repeat consistently. Save the complete ranking for your next grocery trip, and use CalorieCue to keep your portions, protein, and calories visible without turning every meal into a math problem.",
  "socialCopy": {
    "instagram": "Compare protein per one hundred calories.",
    "tiktok": "High protein does not always mean protein dense.",
    "facebook": "A practical way to compare protein foods.",
    "hashtags": ["#CalorieCue", "#HighProtein", "#Nutrition"]
  },
  "video": {
    "provider": "flow-browser",
    "aspectRatio": "9:16",
    "resolution": "1080p",
    "durationSeconds": 8
  },
  "flow": {
    "model": "veo-3.1-fast",
    "creditTier": "non-ultra",
    "outputsPerShot": 1
  },
  "geminiApi": {
    "model": "veo-3.1-fast-generate-preview"
  },
  "elevenlabs": {
    "modelId": "eleven_multilingual_v2",
    "outputFormat": "mp3_44100_128",
    "voiceSettings": {
      "stability": 0.55,
      "similarityBoost": 0.75,
      "style": 0.15,
      "useSpeakerBoost": true
    }
  },
  "shots": [
    { "id": 1, "title": "Hook", "purpose": "Open with contrast", "prompt": "A detailed vertical food comparison scene for shot one, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 2, "title": "Comparison", "purpose": "Show lean protein", "prompt": "A detailed vertical lean seafood preparation scene for shot two, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 3, "title": "Examples", "purpose": "Show protein variety", "prompt": "A detailed vertical arrangement of varied lean proteins for shot three, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 4, "title": "Nuance", "purpose": "Contrast energy density", "prompt": "A detailed vertical visual contrast between food portions for shot four, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 5, "title": "Anchor", "purpose": "Build a meal", "prompt": "A detailed vertical meal assembly scene starting with lean protein for shot five, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 6, "title": "Volume", "purpose": "Add produce", "prompt": "A detailed vertical plate filling with colorful vegetables for shot six, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 7, "title": "Consistency", "purpose": "Show repeatable portions", "prompt": "A detailed vertical meal preparation routine for shot seven, with no text, captions, logos, dialogue, narration, or music." },
    { "id": 8, "title": "CTA", "purpose": "Close on practical action", "prompt": "A detailed vertical finished healthy meal scene for shot eight, with no text, captions, logos, dialogue, narration, or music." }
  ]
}
```

Add this helper and tests to `manifest.test.mjs`:

```js
import {
  estimateVideoUsage,
  getVideoConfiguration,
} from "../lib/manifest.mjs";

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

test("normalizes a version 2 Flow manifest", () => {
  const manifest = validateManifest(makeFlowManifest());
  assert.equal(getVideoConfiguration(manifest).provider, "flow-browser");
  assert.equal(getVideoConfiguration(manifest).durationSeconds, 8);
});

test("treats legacy version 1 manifests as Gemini API packages", () => {
  const config = getVideoConfiguration(validateManifest(makeManifest()));
  assert.equal(config.provider, "gemini-api");
  assert.equal(config.geminiApi.model, "veo-3.1-fast-generate-preview");
});

test("estimates eight Flow Fast outputs at 160 non-Ultra credits", () => {
  assert.deepEqual(estimateVideoUsage(makeFlowManifest()), {
    provider: "flow-browser",
    selectedShots: 8,
    outputs: 8,
    creditsPerGeneration: 20,
    totalCredits: 160,
  });
});

test("counts effective Flow outputs and selected retry shots", () => {
  const manifest = makeFlowManifest({
    flow: {
      model: "veo-3.1-fast",
      creditTier: "non-ultra",
      outputsPerShot: 2,
    },
  });
  assert.equal(estimateVideoUsage(manifest, [2, 5]).totalCredits, 80);
});
```

- [ ] **Step 2: Run the manifest tests and verify the new imports fail**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/manifest.test.mjs
```

Expected: FAIL because `estimateVideoUsage` and `getVideoConfiguration` are not exported.

- [ ] **Step 3: Implement canonical provider configuration and estimates**

Add the Flow table and canonical configuration functions to `manifest.mjs`:

```js
export const FLOW_CREDITS_PER_GENERATION = Object.freeze({
  "veo-3.1-lite": Object.freeze({ "non-ultra": 10, ultra: 5 }),
  "veo-3.1-fast": Object.freeze({ "non-ultra": 20, ultra: 10 }),
  "veo-3.1-quality": Object.freeze({ "non-ultra": 100, ultra: 100 }),
});

export function getVideoConfiguration(input) {
  if (input?.version === 1) {
    return {
      provider: "gemini-api",
      aspectRatio: input.veo?.aspectRatio,
      resolution: input.veo?.resolution,
      durationSeconds: input.veo?.durationSeconds,
      flow: null,
      geminiApi: { model: input.veo?.model },
    };
  }

  return {
    provider: input?.video?.provider,
    aspectRatio: input?.video?.aspectRatio,
    resolution: input?.video?.resolution,
    durationSeconds: input?.video?.durationSeconds,
    flow: input?.flow ?? null,
    geminiApi: input?.geminiApi ?? null,
  };
}

export function estimateVideoUsage(manifestInput, selectedShotIds) {
  const manifest = validateManifest(manifestInput);
  const ids = normalizeShotSelection(manifest, selectedShotIds);
  const video = getVideoConfiguration(manifest);

  if (video.provider === "flow-browser") {
    const outputs = ids.length * video.flow.outputsPerShot;
    const creditsPerGeneration =
      FLOW_CREDITS_PER_GENERATION[video.flow.model][video.flow.creditTier];
    return {
      provider: "flow-browser",
      selectedShots: ids.length,
      outputs,
      creditsPerGeneration,
      totalCredits: outputs * creditsPerGeneration,
    };
  }

  return {
    provider: "gemini-api",
    selectedShots: ids.length,
    totalUsd: estimateVeoCost(manifest, ids),
  };
}
```

Replace the version-only and `validateVeo` call inside `validateManifest` with this provider-aware validation:

```js
function validateProviderVideo(input, problems) {
  if (input.version === 1) {
    validateVeo(input.veo, problems);
    return;
  }
  if (input.version !== 2) {
    problems.push("version must be 1 or 2");
    return;
  }

  if (!isRecord(input.video)) {
    problems.push("video must be an object");
    return;
  }
  if (!["flow-browser", "gemini-api"].includes(input.video.provider)) {
    problems.push('video.provider must be "flow-browser" or "gemini-api"');
  }
  if (input.video.aspectRatio !== "9:16") {
    problems.push('video.aspectRatio must be "9:16"');
  }
  if (!["720p", "1080p", "4k"].includes(input.video.resolution)) {
    problems.push("video.resolution is not supported");
  }
  if (!VALID_DURATIONS.has(input.video.durationSeconds)) {
    problems.push("video.durationSeconds must be 4, 6, or 8");
  }
  if (["1080p", "4k"].includes(input.video.resolution) && input.video.durationSeconds !== 8) {
    problems.push("video.durationSeconds must be 8 for 1080p or 4k generation");
  }

  if (!isRecord(input.flow)) {
    problems.push("flow must be an object");
  } else {
    const tiers = FLOW_CREDITS_PER_GENERATION[input.flow.model];
    if (!tiers) problems.push("flow.model is not supported");
    if (!tiers?.[input.flow.creditTier]) problems.push("flow.creditTier is not supported");
    if (!Number.isInteger(input.flow.outputsPerShot) || input.flow.outputsPerShot < 1 || input.flow.outputsPerShot > 4) {
      problems.push("flow.outputsPerShot must be an integer between 1 and 4");
    }
  }

  if (!isRecord(input.geminiApi) || !VEO_PRICES_PER_SECOND[input.geminiApi.model]) {
    problems.push("geminiApi.model is not a supported Veo 3.1 API model");
  } else if (!VEO_PRICES_PER_SECOND[input.geminiApi.model][input.video.resolution]) {
    problems.push("video.resolution is not supported by geminiApi.model");
  }
}
```

Call `validateProviderVideo(input, problems)`, then call `validateShots(input.shots, getVideoConfiguration(input), input.targetDurationSeconds, problems)`. Rename the `validateShots` parameter from `veo` to `video` and calculate footage with `video.durationSeconds`. Return `structuredClone(input)` only after every problem has been collected.

Update the legacy cost helper to support version 2 API manifests without changing its numeric return type:

```js
export function estimateVeoCost(manifestInput, selectedShotIds) {
  const manifest = validateManifest(manifestInput);
  const ids = normalizeShotSelection(manifest, selectedShotIds);
  const video = getVideoConfiguration(manifest);
  const rate = VEO_PRICES_PER_SECOND[video.geminiApi.model][video.resolution];
  const estimate = ids.length * video.durationSeconds * rate;
  return Math.round((estimate + Number.EPSILON) * 100) / 100;
}
```

- [ ] **Step 4: Run the manifest suite**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/manifest.test.mjs
```

Expected: all manifest tests PASS, including the existing USD 7.68 legacy estimate.

- [ ] **Step 5: Commit the provider model**

```bash
git add .agents/skills/caloriecue-social-video/scripts/lib/manifest.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/manifest.test.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/fixtures/flow-manifest.json
git commit -m "feat: add Flow provider manifest model"
```

---

### Task 2: Resumable Flow queue state

**Files:**
- Create: `.agents/skills/caloriecue-social-video/scripts/lib/flow.mjs`
- Create: `.agents/skills/caloriecue-social-video/scripts/__tests__/flow.test.mjs`

**Interfaces:**
- Consumes: validated version 2 `flow-browser` manifest, output directory, optional existing run, selected reset IDs, and an injectable timestamp.
- Produces: `fingerprintPrompt(prompt)` and `createFlowRun({ manifest, outputDirectory, existingRun, resetChangedShotIds, now })`.

- [ ] **Step 1: Write failing pure-state tests**

Create `flow.test.mjs` with these cases:

```js
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { createFlowRun, fingerprintPrompt } from "../lib/flow.mjs";
import { validateManifest } from "../lib/manifest.mjs";

function flowManifest() {
  return validateManifest({
    version: 2,
    articleUrl: "https://caloriecue.app/blog/example",
    slug: "example",
    targetDurationSeconds: 64,
    narration: Array.from({ length: 130 }, () => "nutrition").join(" "),
    socialCopy: {
      instagram: "Instagram copy",
      tiktok: "TikTok copy",
      facebook: "Facebook copy",
      hashtags: ["#CalorieCue"],
    },
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
    geminiApi: { model: "veo-3.1-fast-generate-preview" },
    elevenlabs: {
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      voiceSettings: {},
    },
    shots: Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      title: `Shot ${index + 1}`,
      purpose: `Purpose ${index + 1}`,
      prompt: `A detailed vertical food scene for approved shot ${index + 1}, without text, logos, narration, or music.`,
    })),
  });
}

test("creates deterministic pending Flow records without secrets", () => {
  const run = createFlowRun({
    manifest: flowManifest(),
    outputDirectory: "/tmp/social-video-assets/example",
    now: "2026-07-16T00:00:00.000Z",
  });
  assert.equal(run.provider, "flow-browser");
  assert.equal(run.shots.length, 8);
  assert.equal(run.shots[0].status, "pending");
  assert.equal(run.shots[0].promptFingerprint.length, 64);
  assert.equal(run.shots[0].outputPath, path.join("/tmp/social-video-assets/example", "shots", "shot-01.mp4"));
  assert.doesNotMatch(JSON.stringify(run), /API_KEY|gemini-key|eleven-key/);
});

test("preserves a matching downloaded record on resume", () => {
  const initial = createFlowRun({ manifest: flowManifest(), outputDirectory: "/tmp/example", now: "2026-07-16T00:00:00.000Z" });
  initial.shots[0] = { ...initial.shots[0], status: "downloaded", bytes: 42, attempts: 1 };
  const resumed = createFlowRun({ manifest: flowManifest(), outputDirectory: "/tmp/example", existingRun: initial, now: "2026-07-16T01:00:00.000Z" });
  assert.equal(resumed.shots[0].status, "downloaded");
  assert.equal(resumed.shots[0].bytes, 42);
});

test("blocks a changed prompt until its shot reset is approved", () => {
  const manifest = flowManifest();
  const initial = createFlowRun({ manifest, outputDirectory: "/tmp/example" });
  manifest.shots[0].prompt += " Changed.";
  assert.throws(
    () => createFlowRun({ manifest, outputDirectory: "/tmp/example", existingRun: initial }),
    /changed prompt.*shot 1/i,
  );
  const reset = createFlowRun({ manifest, outputDirectory: "/tmp/example", existingRun: initial, resetChangedShotIds: [1] });
  assert.equal(reset.shots[0].status, "pending");
  assert.equal(reset.shots[0].replacementApproved, true);
});

test("hashes normalized prompt text consistently", () => {
  assert.equal(fingerprintPrompt("  Hello   world  "), fingerprintPrompt("Hello world"));
});
```

- [ ] **Step 2: Run the Flow-state test and verify the module is missing**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/flow.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/flow.mjs`.

- [ ] **Step 3: Implement the pure queue module**

Create `flow.mjs` with normalized SHA-256 fingerprints, provider validation, prompt-change detection, and record preservation:

```js
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
  now = new Date().toISOString(),
}) {
  const manifest = validateManifest(manifestInput);
  const video = getVideoConfiguration(manifest);
  if (video.provider !== "flow-browser") {
    throw new Error("prepare-flow requires a flow-browser manifest");
  }

  const resetIds = new Set(resetChangedShotIds);
  const existingById = new Map((existingRun?.shots ?? []).map((shot) => [shot.id, shot]));
  const changed = [];
  const shots = manifest.shots.map((shot) => {
    const promptFingerprint = fingerprintPrompt(shot.prompt);
    const existing = existingById.get(shot.id);
    const promptChanged = existing && existing.promptFingerprint !== promptFingerprint;
    if (promptChanged && !resetIds.has(shot.id)) changed.push(shot.id);

    if (existing && !promptChanged) {
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
      replacementApproved: Boolean(promptChanged && resetIds.has(shot.id)),
      updatedAt: now,
    };
  });

  if (changed.length > 0) {
    throw new Error(`Changed prompt requires approved reset for shot ${changed.join(", ")}`);
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
```

- [ ] **Step 4: Run the Flow-state test**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/flow.test.mjs
```

Expected: all Flow-state tests PASS.

- [ ] **Step 5: Commit the queue model**

```bash
git add .agents/skills/caloriecue-social-video/scripts/lib/flow.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/flow.test.mjs
git commit -m "feat: add resumable Flow shot queue"
```

---

### Task 3: Flow preparation, estimates, setup, and Gemini guard

**Files:**
- Modify: `.agents/skills/caloriecue-social-video/scripts/social-video.mjs`
- Modify: `.agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs`

**Interfaces:**
- Consumes: the exact `estimateVideoUsage`, `getVideoConfiguration`, and `createFlowRun` exports defined earlier in this plan.
- Produces: CLI commands `prepare-flow`, provider-aware `estimate`, provider-aware `check-setup`, and an API-only `generate` gate.

- [ ] **Step 1: Add failing CLI tests for Flow mode**

Add this complete `makeFlowManifest` helper and these tests to `cli.test.mjs`:

```js
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
```

Then add:

```js
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
```

Change `setupManifest` to accept an optional manifest value:

```js
async function setupManifest(manifest = makeManifest()) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "caloriecue-cli-"));
  const manifestPath = path.join(cwd, "input", "manifest.json");
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { cwd, manifestPath };
}
```

- [ ] **Step 2: Run the CLI tests and confirm Flow cases fail**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
```

Expected: FAIL because Flow estimates, provider setup, `prepare-flow`, and the API provider gate are not implemented.

- [ ] **Step 3: Implement provider-aware CLI behavior**

In `social-video.mjs`:

```js
import { createFlowRun } from "./lib/flow.mjs";
import {
  estimateVideoUsage,
  estimateVeoCost,
  getVideoConfiguration,
  normalizeShotSelection,
  validateManifest,
} from "./lib/manifest.mjs";

const GEMINI_ENVIRONMENT = ["GEMINI_API_KEY"];
const ELEVENLABS_ENVIRONMENT = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"];

async function runPrepareFlow({ cwd, flags, writeOut }) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  if (flags["confirm-flow-retry"] && !flags.shots) {
    throw new Error("--confirm-flow-retry requires explicit --shots IDs");
  }
  const outputDirectory = path.join(cwd, "social-video-assets", manifest.slug);
  const runPath = path.join(outputDirectory, "flow-run.json");
  const existingRun = await readExistingJson(runPath, "Flow run");
  const resetChangedShotIds = flags["confirm-flow-retry"]
    ? normalizeShotSelection(manifest, flags.shots)
    : [];
  const run = createFlowRun({ manifest, outputDirectory, existingRun, resetChangedShotIds });
  await writeCreativeFiles(outputDirectory, manifest);
  await writeJsonAtomic(runPath, run);
  writeOut(`Flow queue prepared: ${runPath}`);
  return 0;
}
```

Generalize `readExistingReport` into this helper:

```js
async function readExistingJson(filePath, label) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`Unable to resume ${label}: ${error.message}`);
  }
}
```

Use a boolean flag set in `parseArguments`:

```js
const BOOLEAN_FLAGS = new Set([
  "confirm-paid-generation",
  "confirm-flow-retry",
  "confirm-elevenlabs-generation",
]);

if (BOOLEAN_FLAGS.has(key)) {
  flags[key] = true;
  continue;
}
```

Update `estimate` with this provider branch:

```js
const usage = estimateVideoUsage(manifest, selectedIds);
if (usage.provider === "flow-browser") {
  writeOut(`Estimated Flow usage: ${usage.totalCredits} Flow credits for ${usage.selectedShots} shot(s) / ${usage.outputs} output(s)`);
} else {
  writeOut(`Estimated Veo cost: ${formatMoney(usage.totalUsd)} for ${usage.selectedShots} shot(s)`);
}
```

Replace `runSetupCheck` with provider-aware checks:

```js
async function runSetupCheck({ provider, cwd, env, dependencies, writeOut, writeError }) {
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
      const models = await dependencies.listVeoModels({ apiKey: loaded.GEMINI_API_KEY });
      writeOut(`Available Veo 3.1 models: ${models.length > 0 ? models.join(", ") : "none reported"}`);
      checkFailed = models.length === 0;
    } catch (error) {
      writeError(`Gemini setup check failed: ${String(error.message || error)}`);
      checkFailed = true;
    }
  } else if (provider === "flow-browser") {
    writeOut("Flow authentication: verify the signed-in session in Chrome");
  }

  if (loaded.ELEVENLABS_API_KEY && loaded.ELEVENLABS_VOICE_ID) {
    try {
      const voice = await dependencies.getElevenLabsVoice({
        apiKey: loaded.ELEVENLABS_API_KEY,
        voiceId: loaded.ELEVENLABS_VOICE_ID,
      });
      writeOut(`ElevenLabs voice: ${voice.name} (${voice.voice_id})`);
    } catch (error) {
      writeError(`ElevenLabs setup check failed: ${String(error.message || error)}`);
      checkFailed = true;
    }
  }

  if (missing.length > 0) {
    writeError(`Missing environment variables: ${missing.join(", ")}`);
    return 2;
  }
  return checkFailed ? 1 : 0;
}
```

Route setup with `provider: flags.provider ?? "flow-browser"` so the new default is explicit in code.

At the top of `runGeneration`, add this before any approval, environment, or provider network work:

```js
const video = getVideoConfiguration(manifest);
if (video.provider !== "gemini-api") {
  writeError("Gemini API generation requires a gemini-api manifest; this package uses flow-browser.");
  return 2;
}
```

Use `video.geminiApi.model`, `video.aspectRatio`, `video.resolution`, and `video.durationSeconds` for Gemini calls. Require only `GEMINI_ENVIRONMENT` in `runGeneration`; narration moves to Task 4.

Update `makeReport` to store `videoProvider: video.provider`, `video`, and `estimatedVeoCostUsd`, rather than reading `manifest.veo` directly. Update the two existing setup tests that expect a Gemini model check to call `check-setup --provider gemini-api`; a setup call without `--provider` defaults to `flow-browser`.

- [ ] **Step 4: Run manifest, Flow, and CLI tests**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/manifest.test.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/flow.test.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
```

Expected: all selected tests PASS; no test invokes a real network dependency.

- [ ] **Step 5: Commit the provider-aware CLI**

```bash
git add .agents/skills/caloriecue-social-video/scripts/social-video.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
git commit -m "feat: add Flow-first CLI preparation"
```

---

### Task 4: Independent ElevenLabs narration and alignment

**Files:**
- Modify: `.agents/skills/caloriecue-social-video/scripts/social-video.mjs`
- Modify: `.agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs`

**Interfaces:**
- Consumes: validated manifest narration and ElevenLabs settings, `ELEVENLABS_ENVIRONMENT`, injected `generateNarration` and `forceAlign` dependencies.
- Produces: `narrate --manifest ... --confirm-elevenlabs-generation`, plus resumable `narration.mp3`, `alignment.json`, `subtitles.srt`, and narration status in `generation-report.json`.

- [ ] **Step 1: Replace the combined-generation test with narration command tests**

Add tests proving the approval gate and provider independence:

```js
test("blocks narration when ElevenLabs confirmation is absent", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const output = outputCollector();
  const code = await runCli(["narrate", "--manifest", manifestPath], {
    cwd,
    env: { ELEVENLABS_API_KEY: "eleven-key", ELEVENLABS_VOICE_ID: "voice-123" },
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
    listVeoModels: async () => { geminiCalls += 1; return []; },
    submitVeoShot: async () => { geminiCalls += 1; throw new Error("Gemini called"); },
    generateNarration: async ({ outputPath }) => {
      await writeFile(outputPath, Buffer.from("audio"));
      return { outputPath, bytes: 5, characterCost: 130, requestId: "narration-request" };
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
  const code = await runCli(["narrate", "--manifest", manifestPath, "--confirm-elevenlabs-generation"], {
    cwd,
    env: { ELEVENLABS_API_KEY: "eleven-key", ELEVENLABS_VOICE_ID: "voice-123" },
    dependencies,
    ...output,
  });
  assert.equal(code, 0);
  assert.equal(geminiCalls, 0);
  const directory = path.join(cwd, "social-video-assets", "high-protein-low-calorie-foods");
  assert.equal(await readFile(path.join(directory, "narration.mp3"), "utf8"), "audio");
  assert.match(await readFile(path.join(directory, "subtitles.srt"), "utf8"), /Protein matters\./);
});

test("narrate resumes at alignment when narration already exists", async () => {
  const { cwd, manifestPath } = await setupManifest(makeFlowManifest());
  const directory = path.join(cwd, "social-video-assets", "high-protein-low-calorie-foods");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "narration.mp3"), Buffer.from("existing audio"));
  let narrationCalls = 0;
  let alignmentCalls = 0;
  const code = await runCli(["narrate", "--manifest", manifestPath, "--confirm-elevenlabs-generation"], {
    cwd,
    env: { ELEVENLABS_API_KEY: "eleven-key", ELEVENLABS_VOICE_ID: "voice-123" },
    dependencies: {
      ...noNetworkDependencies(),
      generateNarration: async () => { narrationCalls += 1; throw new Error("unexpected narration"); },
      forceAlign: async () => {
        alignmentCalls += 1;
        return { words: [{ text: "Existing", start: 0, end: 0.5 }], characters: [], loss: 0.01 };
      },
    },
  });
  assert.equal(code, 0);
  assert.equal(narrationCalls, 0);
  assert.equal(alignmentCalls, 1);
});
```

- [ ] **Step 2: Run the narration tests and confirm the command is unknown**

Run:

```bash
node --test --test-name-pattern="narrat" .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
```

Expected: FAIL because `narrate` is not implemented.

- [ ] **Step 3: Extract narration from API generation into `runNarration`**

Implement this command flow in `social-video.mjs`:

```js
async function runNarration({ cwd, env, flags, dependencies, writeOut, writeError }) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  if (!flags["confirm-elevenlabs-generation"]) {
    writeError("ElevenLabs generation blocked. Add --confirm-elevenlabs-generation only after explicit user approval.");
    return 2;
  }

  const loaded = await loadEnvironment({ cwd, env });
  const missing = missingEnvironmentVariables(loaded, ELEVENLABS_ENVIRONMENT);
  if (missing.length > 0) {
    writeError(`Missing environment variables: ${missing.join(", ")}`);
    return 2;
  }

  const outputDirectory = path.join(cwd, "social-video-assets", manifest.slug);
  const reportPath = path.join(outputDirectory, "generation-report.json");
  const report = (await readExistingJson(reportPath, "generation report")) ?? {
    version: 2,
    articleUrl: manifest.articleUrl,
    slug: manifest.slug,
    videoProvider: getVideoConfiguration(manifest).provider,
    shots: [],
    narration: { status: "pending" },
  };
  await writeCreativeFiles(outputDirectory, manifest);

  const narrationPath = path.join(outputDirectory, "narration.mp3");
  if (!(await pathExists(narrationPath))) {
    report.narration = { status: "generating" };
    await saveReport(reportPath, report);
    const result = await dependencies.generateNarration({
      apiKey: loaded.ELEVENLABS_API_KEY,
      voiceId: loaded.ELEVENLABS_VOICE_ID,
      text: manifest.narration,
      modelId: manifest.elevenlabs.modelId,
      outputFormat: manifest.elevenlabs.outputFormat,
      voiceSettings: manifest.elevenlabs.voiceSettings,
      outputPath: narrationPath,
    });
    report.narration = { status: "complete", ...result };
    await saveReport(reportPath, report);
  }

  const alignmentPath = path.join(outputDirectory, "alignment.json");
  const subtitlesPath = path.join(outputDirectory, "subtitles.srt");
  if (!(await pathExists(alignmentPath)) || !(await pathExists(subtitlesPath))) {
    const alignment = await dependencies.forceAlign({
      apiKey: loaded.ELEVENLABS_API_KEY,
      audioPath: narrationPath,
      text: manifest.narration,
    });
    await writeJsonAtomic(alignmentPath, alignment);
    await writeFile(subtitlesPath, alignmentToSrt(alignment));
  }

  report.narration = {
    ...report.narration,
    status: "complete",
    outputPath: narrationPath,
  };
  await saveReport(reportPath, report);

  writeOut(`Narration assets: ${outputDirectory}`);
  return 0;
}
```

Place the narration and alignment section inside `try` and use this exact failure branch:

```js
} catch (error) {
  report.narration = {
    ...report.narration,
    status: "failed",
    error: String(error.message || error),
  };
  await saveReport(reportPath, report);
  writeError(`ElevenLabs narration failed: ${String(error.message || error)}`);
  return 1;
}
```

Remove narration work and ElevenLabs environment requirements from `runGeneration`. Route `command === "narrate"` to `runNarration`.

- [ ] **Step 4: Run the CLI and ElevenLabs/subtitle tests**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/elevenlabs.test.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/subtitles.test.mjs
```

Expected: all selected tests PASS; Gemini call counters remain zero in Flow narration tests.

- [ ] **Step 5: Commit narration separation**

```bash
git add .agents/skills/caloriecue-social-video/scripts/social-video.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
git commit -m "feat: separate ElevenLabs narration generation"
```

---

### Task 5: Editor-ready asset verification

**Files:**
- Create: `.agents/skills/caloriecue-social-video/scripts/lib/assets.mjs`
- Create: `.agents/skills/caloriecue-social-video/scripts/__tests__/assets.test.mjs`
- Modify: `.agents/skills/caloriecue-social-video/scripts/social-video.mjs`
- Modify: `.agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs`

**Interfaces:**
- Consumes: a validated manifest and its computed `social-video-assets/{slug}` directory.
- Produces: `verifyAssetPackage({ manifest, outputDirectory }) -> { valid, files, problems }` and the `verify-assets` CLI command.

- [ ] **Step 1: Write failing asset inspection tests**

Create `assets.test.mjs`:

```js
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyAssetPackage } from "../lib/assets.mjs";

const manifest = {
  version: 2,
  slug: "example",
  shots: [{ id: 1 }, { id: 2 }],
  video: { provider: "flow-browser" },
};

async function writeRequired(directory, emptyPath = null) {
  const files = [
    "brief.md",
    "manifest.json",
    "narration-script.txt",
    "social-copy.md",
    "flow-run.json",
    "generation-report.json",
    "narration.mp3",
    "alignment.json",
    "subtitles.srt",
    "shots/shot-01.mp4",
    "shots/shot-02.mp4",
  ];
  const structuredContents = {
    "manifest.json": JSON.stringify(manifest),
    "flow-run.json": JSON.stringify({
      shots: manifest.shots.map((shot) => ({ id: shot.id, status: "downloaded" })),
    }),
    "generation-report.json": JSON.stringify({ narration: { status: "complete" } }),
    "alignment.json": JSON.stringify({ words: [{ text: "Ready", start: 0, end: 0.5 }] }),
  };
  for (const relativePath of files) {
    const filePath = path.join(directory, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    const contents = structuredContents[relativePath] ?? "asset";
    await writeFile(filePath, relativePath === emptyPath ? "" : contents);
  }
}

test("reports exact missing handoff paths", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /brief\.md/);
  assert.match(result.problems.join("\n"), /shot-01\.mp4/);
});

test("rejects an empty generated asset", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory, "narration.mp3");
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /narration\.mp3.*empty/i);
});

test("accepts a complete consistently named Flow handoff", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory);
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, true);
  assert.deepEqual(result.problems, []);
});

test("rejects unresolved Flow queue state", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "caloriecue-assets-"));
  await writeRequired(directory);
  await writeFile(
    path.join(directory, "flow-run.json"),
    JSON.stringify({ shots: [{ id: 1, status: "submitted" }, { id: 2, status: "downloaded" }] }),
  );
  const result = await verifyAssetPackage({ manifest, outputDirectory: directory });
  assert.equal(result.valid, false);
  assert.match(result.problems.join("\n"), /shot 1.*submitted/i);
});
```

- [ ] **Step 2: Run the asset test and verify the module is missing**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/assets.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `lib/assets.mjs`.

- [ ] **Step 3: Implement read-only package verification**

Create `assets.mjs`:

```js
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

async function inspect(relativePath, outputDirectory, problems, files) {
  const absolutePath = path.join(outputDirectory, relativePath);
  try {
    const details = await stat(absolutePath);
    if (!details.isFile()) problems.push(`${relativePath} is not a file`);
    else if (details.size === 0) problems.push(`${relativePath} is empty`);
    else files.push({ path: absolutePath, bytes: details.size });
  } catch (error) {
    if (error?.code === "ENOENT") problems.push(`${relativePath} is missing`);
    else throw error;
  }
}

export async function verifyAssetPackage({ manifest, outputDirectory }) {
  const problems = [];
  const files = [];
  const required = [
    "brief.md",
    "manifest.json",
    "narration-script.txt",
    "social-copy.md",
    "generation-report.json",
    "narration.mp3",
    "alignment.json",
    "subtitles.srt",
    ...(manifest.video?.provider === "flow-browser" ? ["flow-run.json"] : []),
    ...manifest.shots.map((shot) => `shots/shot-${String(shot.id).padStart(2, "0")}.mp4`),
  ];
  for (const relativePath of required) {
    await inspect(relativePath, outputDirectory, problems, files);
  }

  if (manifest.video?.provider === "flow-browser") {
    try {
      const flowRun = JSON.parse(await readFile(path.join(outputDirectory, "flow-run.json"), "utf8"));
      const byId = new Map((flowRun.shots ?? []).map((shot) => [shot.id, shot]));
      for (const shot of manifest.shots) {
        const record = byId.get(shot.id);
        if (!record) problems.push(`flow-run.json is missing shot ${shot.id}`);
        else if (record.status !== "downloaded") problems.push(`flow-run.json shot ${shot.id} is ${record.status}`);
      }
    } catch (error) {
      problems.push(`flow-run.json is invalid JSON: ${error.message}`);
    }
  }

  try {
    const report = JSON.parse(await readFile(path.join(outputDirectory, "generation-report.json"), "utf8"));
    if (report.narration?.status !== "complete") {
      problems.push(`generation-report.json narration is ${report.narration?.status ?? "missing"}`);
    }
  } catch (error) {
    problems.push(`generation-report.json is invalid JSON: ${error.message}`);
  }
  return { valid: problems.length === 0, files, problems };
}
```

Add this command handler to the CLI:

```js
async function runVerifyAssets({ cwd, flags, writeOut, writeError }) {
  const { manifest } = await readManifest(flags.manifest, cwd);
  const outputDirectory = path.join(cwd, "social-video-assets", manifest.slug);
  const result = await verifyAssetPackage({ manifest, outputDirectory });
  if (!result.valid) {
    for (const problem of result.problems) writeError(problem);
    return 1;
  }
  writeOut(`Asset package valid: ${outputDirectory}`);
  return 0;
}
```

Import `verifyAssetPackage`, route `command === "verify-assets"` to `runVerifyAssets`, and include every supported command in the usage string.

- [ ] **Step 4: Run asset and CLI verification tests**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/assets.test.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
```

Expected: all selected tests PASS.

- [ ] **Step 5: Commit asset verification**

```bash
git add .agents/skills/caloriecue-social-video/scripts/lib/assets.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/assets.test.mjs .agents/skills/caloriecue-social-video/scripts/social-video.mjs .agents/skills/caloriecue-social-video/scripts/__tests__/cli.test.mjs
git commit -m "feat: verify social video handoff assets"
```

---

### Task 6: Flow-first skill instructions and Chrome runbook

**Files:**
- Modify: `.agents/skills/caloriecue-social-video/SKILL.md`
- Modify: `.agents/skills/caloriecue-social-video/references/creative-package.md`
- Create: `.agents/skills/caloriecue-social-video/references/flow-browser.md`
- Modify: `.agents/skills/caloriecue-social-video/agents/openai.yaml`

**Interfaces:**
- Consumes: the commands and state contracts implemented in Tasks 1–5 and the installed `chrome:control-chrome` capability.
- Produces: a project skill that defaults to Flow, obtains one approval, uses Chrome safely, writes queue milestones, and stops at the editor-ready handoff.

- [ ] **Step 1: Write the Flow browser reference**

Create `references/flow-browser.md` with these exact sections and rules:

```markdown
# Browser-assisted Google Flow Runbook

Read this file completely before operating Flow.

## Preconditions

- The creative package and every prompt are approved.
- `estimate` and `prepare-flow` have succeeded.
- The approval sheet states the effective outputs per request, total Flow credits, ElevenLabs usage, and visible-watermark notice.
- Read and follow the installed `chrome:control-chrome` skill before browser interaction.

## Reconcile before submitting

Open `flow-run.json`. For every `submitted` shot, inspect the saved Flow project and visible history before clicking Generate. If a matching result exists, download it and continue from that result. If the state is ambiguous, stop and ask; never submit a duplicate merely because the task resumed.

## Generate one approved shot

1. Open or reuse the Flow project for the manifest slug.
2. Confirm Veo model, 9:16 orientation, duration, and output count against the manifest and approval.
3. If the UI shows a different credit cost or output count, stop and refresh approval.
4. Paste one pending shot prompt and click Generate once.
5. After visible acceptance, update that shot to `submitted`, increment `attempts`, and save the Flow project URL and timestamp.
6. Wait for a terminal result without submitting another prompt.
7. On failure, mark `failed` and stop that shot; retry needs new approval.

## Download and confirm

Download one approved result. Reconcile the browser's confirmed download entry to its local filename; never choose an arbitrary newest file. Move through a temporary filename, validate that the MP4 is non-empty, then place it at `shots/shot-XX.mp4` and mark the queue record `downloaded` with byte count and timestamp. Do not delete or rename unrelated files in Downloads or `video/`.

## Recovery and fallback

- Login or CAPTCHA: pause for the user.
- Changed UI: stop before a credit-consuming click.
- Insufficient credits: report pending shot IDs and stop.
- Ambiguous submission: inspect project history; do not retry.
- Chrome unavailable: hand the user the numbered prompts and download names for manual Flow operation.
```

- [ ] **Step 2: Rewrite the skill workflow as Flow-first**

Update `SKILL.md` so its core workflow is:

```markdown
1. Run `check-setup --provider flow-browser` and resolve the article.
2. Read `references/creative-package.md` and draft a version 2 Flow manifest.
3. Validate, estimate Flow credits, and run `prepare-flow`; none of these spends credits.
4. Present one approval sheet with every prompt, effective Flow output count, total credits, ElevenLabs usage, and watermark notice.
5. After approval, read `references/flow-browser.md`, use Chrome to generate and download one shot at a time, and update `flow-run.json` only at confirmed milestones.
6. Run `narrate --confirm-elevenlabs-generation`, then `verify-assets`.
7. Stop for the user's edit.
```

Keep Gemini API as a separate fallback section that requires the manifest to be changed to `gemini-api`, a refreshed USD estimate, an explicit budget, and `--confirm-paid-generation`. State that Flow retries and ElevenLabs replacement runs require separate approval.

- [ ] **Step 3: Update the creative contract and default prompt**

Replace the version 1 provider fields in the `creative-package.md` example with this exact block while preserving the existing article, narration, social copy, ElevenLabs, and shots fields:

```json
{
  "version": 2,
  "video": {
    "provider": "flow-browser",
    "aspectRatio": "9:16",
    "resolution": "1080p",
    "durationSeconds": 8
  },
  "flow": {
    "model": "veo-3.1-fast",
    "creditTier": "non-ultra",
    "outputsPerShot": 1
  },
  "geminiApi": {
    "model": "veo-3.1-fast-generate-preview"
  }
}
```

Replace approval-sheet item 6 with:

```markdown
6. Flow model, duration, resolution, effective outputs per request, credits per generation, total Flow credits, visible balance when readable, ElevenLabs narration character count, and Google AI Pro visible-watermark notice.
```

Replace the first handoff item with:

```markdown
- flow-run.json has no unresolved `submitted`, `pending`, or `failed` shot required by the approved manifest.
```

Change `agents/openai.yaml` to:

```yaml
interface:
  display_name: "CalorieCue Social Video"
  short_description: "Turn CalorieCue blogs into Flow-first video assets"
  default_prompt: "Use $caloriecue-social-video to turn this CalorieCue blog URL into an approved set of browser-assisted Google Flow clips, ElevenLabs narration, subtitle timings, and social copy."
```

- [ ] **Step 4: Validate the skill package**

Run:

```bash
python3 /Users/juan_oclock/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/caloriecue-social-video
```

Expected: `Skill is valid!`

- [ ] **Step 5: Commit the Flow-first instructions**

```bash
git add .agents/skills/caloriecue-social-video/SKILL.md .agents/skills/caloriecue-social-video/references/creative-package.md .agents/skills/caloriecue-social-video/references/flow-browser.md .agents/skills/caloriecue-social-video/agents/openai.yaml
git commit -m "docs: make social video skill Flow-first"
```

---

### Task 7: Full verification and safe handoff

**Files:**
- Verify only; modify a file only if a failing test identifies a defect in the scoped implementation.

**Interfaces:**
- Consumes: all implementation tasks.
- Produces: verified feature branch with no paid generation performed.

- [ ] **Step 1: Run the entire skill test suite**

Run:

```bash
node --test .agents/skills/caloriecue-social-video/scripts/__tests__/*.test.mjs
```

Expected: every manifest, Flow, CLI, asset, Gemini, ElevenLabs, and subtitle test PASS.

- [ ] **Step 2: Run the repository test suite**

Run:

```bash
npm run test:run
```

Expected: all repository tests PASS; `.agents/**` remains excluded from Vitest and is covered by Step 1.

- [ ] **Step 3: Revalidate the finished skill**

Run:

```bash
python3 /Users/juan_oclock/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/caloriecue-social-video
```

Expected: `Skill is valid!`

- [ ] **Step 4: Perform a no-spend CLI smoke test**

Run the three no-spend commands against the complete repository fixture created in Task 1:

```bash
mkdir -p /tmp/caloriecue-flow-smoke
cd /tmp/caloriecue-flow-smoke
node "/Users/juan_oclock/Downloads/Juan-Oclock/CalorieCue Project/caloriecue-landing/.agents/skills/caloriecue-social-video/scripts/social-video.mjs" validate --manifest "/Users/juan_oclock/Downloads/Juan-Oclock/CalorieCue Project/caloriecue-landing/.agents/skills/caloriecue-social-video/scripts/__tests__/fixtures/flow-manifest.json"
node "/Users/juan_oclock/Downloads/Juan-Oclock/CalorieCue Project/caloriecue-landing/.agents/skills/caloriecue-social-video/scripts/social-video.mjs" estimate --manifest "/Users/juan_oclock/Downloads/Juan-Oclock/CalorieCue Project/caloriecue-landing/.agents/skills/caloriecue-social-video/scripts/__tests__/fixtures/flow-manifest.json"
node "/Users/juan_oclock/Downloads/Juan-Oclock/CalorieCue Project/caloriecue-landing/.agents/skills/caloriecue-social-video/scripts/social-video.mjs" prepare-flow --manifest "/Users/juan_oclock/Downloads/Juan-Oclock/CalorieCue Project/caloriecue-landing/.agents/skills/caloriecue-social-video/scripts/__tests__/fixtures/flow-manifest.json"
```

Expected: validation succeeds, estimate reports Flow credits, and `prepare-flow` writes pending local state only under `/tmp/caloriecue-flow-smoke/social-video-assets/`. No Gemini, ElevenLabs, or Flow generation call occurs.

- [ ] **Step 5: Inspect the final diff and repository state**

Run:

```bash
git diff --check
git status --short
git log --oneline --decorate -8
```

Expected: no whitespace errors; only intended branch commits and the pre-existing untracked `video/` directory remain. Confirm that `content/draft` was not checked out, merged, rebased, or modified.

- [ ] **Step 6: Report the live-browser verification boundary**

State explicitly that no credits were spent during implementation. The first actual blog run will verify the live Flow UI and one approved generation; do not perform that credit-consuming test without a separately approved creative package and credit estimate.
