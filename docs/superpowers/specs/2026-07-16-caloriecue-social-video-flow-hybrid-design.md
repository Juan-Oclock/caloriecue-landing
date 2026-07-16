# CalorieCue Social Video Flow Hybrid Design

## Status and relationship to the original design

This design changes the default video provider in the existing CalorieCue social-video skill from the paid Gemini API to browser-assisted Google Flow. It supplements and overrides the Gemini-default portions of `2026-07-16-caloriecue-social-video-skill-design.md`; the original article analysis, creative approval, ElevenLabs narration, subtitle generation, output layout, and editor-ready stopping point remain in force.

## Goal

Use the Google AI Pro subscription credits already available in Google Flow for routine Veo shots while preserving the speed and safety of the project skill. The user should be able to provide a CalorieCue blog URL, approve one creative package, and let Codex operate Flow through the signed-in Chrome session. Gemini API generation remains an explicitly selected fallback for unattended or high-volume runs.

## Chosen approach

The default is a guided, resumable browser queue rather than a fully scripted UI macro or a manual prompt handoff.

- Codex prepares deterministic local state and one prompt per shot.
- Codex uses the Chrome control capability to operate the user's existing Flow session.
- Each Flow generation is submitted and downloaded individually.
- Local state records only confirmed milestones so an interrupted task can safely resume.
- The user intervenes only for authentication, CAPTCHA, materially changed Flow UI, unavailable credits, or a new spending decision.

A fully scripted browser macro is out of scope because selectors and generation controls can change without notice. A manual prompt pack remains available as the fallback when Chrome control cannot continue.

## Provider model

The manifest gains an explicit video provider while remaining backward compatible with existing manifests:

- `flow-browser` is the default for newly created packages.
- `gemini-api` preserves the existing API implementation and its USD budget gate.
- An existing manifest without a provider is treated as `gemini-api` so an old approved package never silently changes execution behavior.

The provider-specific configuration is separated from common video settings:

```json
{
  "video": {
    "provider": "flow-browser",
    "durationSeconds": 8,
    "aspectRatio": "9:16",
    "resolution": "1080p"
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

The migration layer accepts the current `veo` object so existing packages and tests continue to work. New creative packages use the provider-aware schema.

## Components

### Creative package and approval sheet

The existing brief, narration, social copy, manifest, and per-shot prompts remain the source of truth. Before generation, the approval sheet shows:

- The complete narration and every Veo prompt.
- The selected Flow model, duration, aspect ratio, resolution, and effective number of outputs shown by the current Flow UI.
- The current expected Flow-credit cost per generation and total project estimate.
- The currently visible Flow balance when Chrome can read it; otherwise the balance is marked unverified.
- ElevenLabs narration character count and the fact that it consumes ElevenLabs plan credits.
- The current visible-watermark limitation for Google AI Pro Flow output.
- The exact retry policy: one output per shot and no automatic retries.

Official Flow credit costs must be verified before approval. The local estimator provides a deterministic planning value, but a changed value visible in Flow takes precedence and requires the approval sheet to be refreshed.

### Local Flow queue

The command `prepare-flow` validates a `flow-browser` manifest and creates `flow-run.json` without network access or paid calls. It contains no secrets and tracks each shot with these states:

- `pending`: no submission has been confirmed.
- `submitted`: Flow visibly accepted the prompt, but no local asset has been confirmed.
- `downloaded`: the expected MP4 exists locally and passed basic validation.
- `failed`: Flow displayed a terminal failure; retry still requires approval.

Each shot record includes its ID, prompt fingerprint, attempt count, Flow project URL when available, timestamps, downloaded filename, destination path, byte count, and a short non-secret error message. A prompt change resets only the affected shot to `pending` after confirmation.

### Browser-assisted Flow runner

The skill, rather than the Node.js CLI, performs the UI interaction through Chrome:

1. Open or reuse a Flow project named for the article slug.
2. Confirm the selected model, 9:16 orientation, duration, and requested output count. Select one output when Flow offers that control.
3. Reconcile `submitted` records against the visible Flow project before submitting anything new.
4. Submit exactly one pending prompt and confirm that Flow accepted it.
5. Wait for the generation to finish and inspect the visible result.
6. Download exactly one approved result.
7. Confirm the browser download, move it into `social-video-assets/<slug>/shots/shot-XX.mp4`, validate it, and mark the record `downloaded`.
8. Continue with the next pending shot.

If a submission click has an ambiguous result, the runner inspects the Flow project or generation history. It must not click submit again merely because the browser task was interrupted.

### Narration and subtitle command

The existing ElevenLabs work is separated from Veo API generation through a `narrate` command. It:

- Requires `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`, but not `GEMINI_API_KEY`.
- Requires `--confirm-elevenlabs-generation` after the creative package is approved.
- Generates `narration.mp3` only when it is missing or explicitly selected for replacement.
- Runs forced alignment against the exact approved narration and writes `alignment.json` and `subtitles.srt`.
- Resumes at alignment when narration already exists.

This command can run regardless of whether the video provider is Flow or Gemini API.

### Gemini API fallback

The current `generate` command becomes explicitly API-only. It refuses to run unless the manifest provider is `gemini-api`. Changing a package from Flow to API requires a refreshed approval sheet with the USD estimate. It retains:

- `--confirm-paid-generation`.
- `--budget-usd`.
- Saved operation IDs and safe polling.
- Selective shot regeneration.
- No automatic retries after ambiguous paid submissions.

Flow mode never reads or calls `GEMINI_API_KEY` during shot generation.

## Commands

The intended command surface is:

```bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs check-setup --provider flow-browser
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs validate --manifest social-video-assets/<slug>/manifest.json
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs estimate --manifest social-video-assets/<slug>/manifest.json
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs prepare-flow --manifest social-video-assets/<slug>/manifest.json
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs narrate --manifest social-video-assets/<slug>/manifest.json --confirm-elevenlabs-generation
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs verify-assets --manifest social-video-assets/<slug>/manifest.json
```

The existing API command remains available only for an explicitly API-configured manifest:

```bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs generate --manifest social-video-assets/<slug>/manifest.json --budget-usd <approved-usd> --confirm-paid-generation
```

## Setup behavior

`check-setup --provider flow-browser` verifies ElevenLabs credentials and voice access without generating audio. It reports that Flow authentication must be verified through Chrome and does not require a Gemini key.

`check-setup --provider gemini-api` retains the current non-generating Veo model visibility check and ElevenLabs voice check.

Neither setup mode prints secret values or performs a billable generation.

## Credit and retry controls

For the current non-Ultra Flow tier, the planning table uses the official per-generation values for Veo 3.1 Lite, Fast, and Quality. The estimator multiplies per-generation credits by the effective number of generated outputs, not by prompt requests. If Flow does not allow a single-output request, the browser runner refreshes the approval sheet with the output count visible in the UI before submission.

The skill does not assume that 1,000 monthly credits remain. Chrome reads the current balance when possible. Generation stops before a shot when the visible balance is below its cost.

Retries are separate approvals. The user sees the failed shot IDs, revised prompts if any, the number of new outputs, and the additional Flow-credit estimate before Chrome submits them.

## File and download safety

- Browser downloads are not considered complete until the local MP4 exists and is non-empty.
- The runner never chooses an arbitrary newest file when multiple downloads could match; it reconciles the browser's confirmed download entry with the shot record.
- Existing completed shot files are not overwritten without a retry approval for that shot.
- Temporary filenames remain outside the final `shots/` names until validation succeeds.
- User-owned files in `video/`, Downloads, or other directories are never deleted or renamed as cleanup.

## Failure and recovery

- Login or CAPTCHA: pause for the user, then resume the same queue record.
- Changed Flow UI: stop before submission and fall back to the manual prompt pack if safe browser operation cannot be confirmed.
- Insufficient credits: stop before the next submission and report the remaining shot IDs.
- Flow terminal failure: mark the shot `failed`; do not retry without approval.
- Ambiguous submission: inspect Flow history; never resubmit merely because local state is incomplete.
- Interrupted download: reconcile Chrome downloads and Flow results before retrying the download.
- Narration failure: preserve all downloaded Flow clips.
- Alignment failure: preserve narration and rerun alignment only.
- Asset verification failure: report exact missing or invalid paths and keep valid assets.

## Testing strategy

Tests are added before implementation and cover:

- New manifests default to `flow-browser` while legacy manifests remain `gemini-api`.
- Flow Fast estimates eight single-output shots at 160 non-Ultra credits.
- Estimates count generated outputs and selected retry shots correctly.
- `prepare-flow` creates deterministic, secret-free state and preserves completed records on resume.
- A changed prompt is detected and cannot silently reuse the old download.
- Flow setup does not require or access `GEMINI_API_KEY`.
- API generation refuses a Flow manifest before any network call.
- `narrate` requires explicit confirmation, supports alignment-only resume, and never calls Gemini.
- Asset verification rejects missing, empty, or incorrectly named files.
- Existing Gemini API generation, budget gates, secret redaction, ElevenLabs, alignment, and subtitle tests continue to pass.

Browser UI behavior is verified with a dry-run checklist and a single user-approved Flow generation; automated unit tests do not spend Flow credits.

## Acceptance criteria

- A new CalorieCue blog request produces a Flow-first creative package and credit estimate.
- No Gemini API video request occurs in the default workflow.
- After approval, Codex can operate the signed-in Flow session one shot at a time and resume without duplicating a confirmed submission.
- One approved Flow result is downloaded and consistently named for each shot; Flow never receives a request configured for more generated outputs than the approved estimate.
- A failed or questionable generation cannot consume retry credits without new approval.
- ElevenLabs narration, forced alignment, and SRT generation work independently of the video provider.
- API generation remains available only through an explicit provider choice and the existing USD budget confirmation.
- The final handoff contains the approved Markdown, manifest, Flow state, MP4, MP3, JSON, and SRT assets and stops before editing or publishing.

## Out of scope

- Remotion or other automated final-video assembly.
- Music selection or licensing.
- TikTok, Instagram, or Facebook uploading and publishing.
- CAPTCHA bypass or storage of Google session credentials.
- Automatic purchase of additional Flow credits.
- Multiple speculative Flow variations per shot.
