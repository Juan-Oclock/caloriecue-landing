---
name: caloriecue-social-video
description: Use when a CalorieCue blog URL is provided and the user wants a 60–75 second vertical video, Veo shots, ElevenLabs narration, subtitle timings, or editor-ready assets for TikTok, Instagram, or Facebook.
---

# CalorieCue Social Video

## Core principle

Review the package before spending. Generate assets; stop before editing or publishing.

## Workflow

1. Preflight and resolve the article.
   - Run check-setup below; report missing variable names without requesting values.
   - Accept an HTTPS caloriecue.app/blog/<slug> URL.
   - Read content/blog/<slug>.mdx when it exists; otherwise read the published page.
   - Use only supported claims and preserve qualifications.

2. Draft the creative package.
   - Read references/creative-package.md completely.
   - Create social-video-assets/<slug>/brief.md, narration-script.txt, social-copy.md, and manifest.json.
   - Default to 8 shots, 8 seconds each, 9:16, 1080p, and veo-3.1-fast-generate-preview.
   - Keep text, labels, logos, and app UI out of Veo prompts. Supply separate editor assets.

3. Validate without spending.

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs validate --manifest social-video-assets/<slug>/manifest.json
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs estimate --manifest social-video-assets/<slug>/manifest.json
~~~

4. Present one approval sheet.
   - Show the hook, full narration, shot list, every Veo prompt, voice choice, social copy, estimate, and proposed maximum budget.
   - Verify official Veo pricing. State that the estimate excludes ElevenLabs plan-credit usage.
   - Wait for explicit approval of this package. Prior-package approval does not count.

5. Generate only after approval.

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs generate --manifest social-video-assets/<slug>/manifest.json --budget-usd 15 --confirm-paid-generation
~~~

Replace 15 with the exact approved budget. The command saves operation IDs, downloads clips, generates narration, aligns it, and writes SRT captions.

6. Inspect the handoff.
   - Read generation-report.json.
   - Verify expected MP4, MP3, JSON, SRT, and Markdown files are non-empty.
   - Report failed shot IDs. Regenerate only after separate approval of the IDs and retry budget:

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs generate --manifest social-video-assets/<slug>/manifest.json --shots 2,5 --budget-usd 5 --confirm-paid-generation
~~~

7. Stop.
   - Hand the package to the user for editing.
   - Do not use Remotion, add music, upload, or publish unless separately requested.

## Secrets and safety

- Read GEMINI_API_KEY, ELEVENLABS_API_KEY, and ELEVENLABS_VOICE_ID from the environment or .env.local.
- Never ask for keys in chat, display their values, place them in URLs, prefix them with NEXT_PUBLIC_, or write them into manifests and reports.
- Preflight with:

~~~bash
node .agents/skills/caloriecue-social-video/scripts/social-video.mjs check-setup
~~~

- Treat a saved Veo operation ID as resumable work. Poll it; never resubmit because polling was interrupted.
- Never retry an ambiguous paid Veo POST automatically.
- If official pricing changed, update the local table with tests before approval.

## Common mistakes

| Mistake | Correction |
|---|---|
| Generating before the user sees every prompt | Validate, estimate, present, then wait |
| Asking Veo to render captions or app screens | Produce clean footage and use real UI in the edit |
| Generating several speculative variations | Generate one approved shot; retry selected failures only |
| Re-running all shots after one failure | Use --shots with explicit IDs |
| Continuing into editing or posting | Stop at the editor-ready asset handoff |
