---
name: caloriecue-social-video
description: Use when a CalorieCue blog URL is provided and the user wants a 60–75 second vertical video, Veo shots, ElevenLabs narration, subtitle timings, or editor-ready assets for TikTok, Instagram, or Facebook.
---

# CalorieCue Social Video

## Core principle

Review one complete package before spending credits or plan usage. Use browser-assisted Google Flow for new packages, generate editor-ready assets, and stop before editing or publishing.

## Workflow

1. Run `check-setup --provider flow-browser` and resolve the article.
   - Report missing variable names without requesting values.
   - Accept an HTTPS caloriecue.app/blog/<slug> URL.
   - Read content/blog/<slug>.mdx when it exists; otherwise read the published page.
   - Use only supported claims and preserve qualifications.

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs check-setup --provider flow-browser
~~~

2. Read `references/creative-package.md` completely and draft a version 2 Flow manifest.
   - Create social-video-assets/<slug>/brief.md, narration-script.txt, social-copy.md, and manifest.json.
   - New packages default to `version: 2`, `video.provider: "flow-browser"`, 8 shots, 8 seconds each, 9:16, 1080p, and `veo-3.1-fast` with one output per shot.
   - Legacy version 1 packages remain `gemini-api`; do not silently convert or run them through Flow.
   - Keep text, labels, logos, and app UI out of Veo prompts. Supply separate editor assets.

3. Validate, estimate Flow credits, and prepare the resumable Flow queue. None of these commands spends credits.

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs validate --manifest social-video-assets/<slug>/manifest.json
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs estimate --manifest social-video-assets/<slug>/manifest.json
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs prepare-flow --manifest social-video-assets/<slug>/manifest.json
~~~

4. Present one approval sheet.
   - Show the hook, full narration, every shot and prompt, voice choice, social copy, effective Flow outputs per request, credits per generation, total Flow credits, visible balance when readable, ElevenLabs narration character count and usage, and the Google AI Pro visible-watermark notice.
   - Wait for explicit approval of this exact package, Flow-credit total, and ElevenLabs use. Prior-package approval does not count.

5. After approval, read `references/flow-browser.md` completely, then use the user's signed-in Chrome session to generate and download one approved shot/output at a time.
   - Read and follow the installed `chrome:control-chrome` skill before any browser interaction.
   - Reconcile `flow-run.json` and the saved Flow project history before every credit-consuming click.
   - Update `flow-run.json` only at confirmed `submitted`, terminal `failed`, or `downloaded` milestones.
   - Never retry an ambiguous submission. A Flow retry requires separate approval of the shot IDs and added credits.

After that retry approval, reset only the named terminally failed shots with:

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs prepare-flow --manifest social-video-assets/<slug>/manifest.json --shots <FAILED_IDS> --confirm-flow-retry
~~~

6. Generate the approved narration, then verify the editor-ready package.

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs narrate --manifest social-video-assets/<slug>/manifest.json --confirm-elevenlabs-generation
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs verify-assets --manifest social-video-assets/<slug>/manifest.json
~~~

The initial package approval covers one narration generation. Any ElevenLabs replacement generation requires separate approval.

After that separate replacement approval, replace the complete narration asset chain with:

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs narrate --manifest social-video-assets/<slug>/manifest.json --confirm-elevenlabs-generation --confirm-elevenlabs-replacement
~~~

7. Stop for the user's edit. Hand off the editor-ready assets only; do not use Remotion, assemble or edit the video, add music, upload, or publish.

## Gemini API fallback

Use Gemini API only when the user explicitly chooses the fallback. Change a version 2 manifest to `video.provider: "gemini-api"` (legacy version 1 already resolves to `gemini-api`), rerun `validate` and `estimate` for a refreshed USD estimate, present an exact hard budget, and wait for explicit approval. Then run:

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs generate --manifest social-video-assets/<slug>/manifest.json --budget-usd <EXACT_APPROVED_BUDGET> --confirm-paid-generation
~~~

Never call `generate` for a `flow-browser` manifest. Gemini retries require separate approval of the affected shot IDs and added budget; use `--shots <IDs>` to limit an approved retry.

## Secrets and safety

- Read GEMINI_API_KEY, ELEVENLABS_API_KEY, and ELEVENLABS_VOICE_ID from the environment or .env.local.
- Never ask for keys in chat, display their values, place them in URLs, prefix them with NEXT_PUBLIC_, or write them into manifests and reports.
- Use the user's existing signed-in Chrome session for Flow. Never store Google credentials or bypass login or CAPTCHA.
- Treat a saved Veo operation ID as resumable work. Poll it; never resubmit because polling was interrupted.
- Never retry an ambiguous paid Veo POST automatically.
- If official pricing changed, update the local table with tests before approval.

## Common mistakes

| Mistake | Correction |
|---|---|
| Generating before the user sees every prompt | Validate, estimate, present, then wait |
| Asking Veo to render captions or app screens | Produce clean footage and use real UI in the edit |
| Clicking Generate again after an interruption | Reconcile `flow-run.json` and Flow history; stop if ambiguous |
| Generating several speculative variations | Generate one approved shot/output at a time |
| Re-running a failed shot without new approval | Obtain approval for the affected shot IDs and added credits or budget |
| Replacing narration under the initial approval | Obtain separate ElevenLabs replacement approval |
| Continuing into editing or posting | Stop at the editor-ready asset handoff |
