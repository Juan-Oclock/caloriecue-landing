# Browser-assisted Google Flow Runbook

Read this file completely before operating Flow.

## Preconditions

- The creative package and every prompt are approved.
- `estimate` and `prepare-flow` have succeeded.
- The approval sheet states the effective outputs per request, total Flow credits, ElevenLabs usage, and visible-watermark notice.
- Read and follow the installed `chrome:control-chrome` skill before browser interaction.
- Use the user's existing signed-in Chrome session. Never store Google credentials or bypass login or CAPTCHA.

## Reconcile before submitting

Open `flow-run.json`. Before any click on Generate, inspect the saved Flow project and visible history. For every `submitted` shot, reconcile the local record with that history. If a matching result exists, download it and continue from that result. If the state is ambiguous, stop and ask; never submit a duplicate merely because the task resumed.

## Generate one approved shot

1. Open or reuse the Flow project for the manifest slug.
2. Confirm Veo model, 9:16 orientation, duration, and output count against the manifest and approval.
3. If the UI shows a different credit cost or output count, stop and refresh approval.
4. Paste one pending shot prompt and click Generate once.
5. After visible acceptance, update that shot to `submitted`, increment `attempts`, and save the Flow project URL and timestamp.
6. Wait for a terminal result without submitting another prompt.
7. On a visible terminal failure, mark `failed` and stop that shot; retry needs separate approval for that shot ID and the added credits.

Update `flow-run.json` only at these confirmed milestones. Never infer acceptance or failure from a timeout, stale tab, or interrupted browser session.

## Download and confirm

Download one approved result. Reconcile the browser's confirmed download entry to its local filename; never choose an arbitrary newest file. Move through a temporary filename, validate that the MP4 is non-empty, then place it at `shots/shot-XX.mp4` and mark the queue record `downloaded` with byte count and timestamp. Do not delete or rename unrelated files in Downloads or `video/`.

## Recovery and fallback

- Login or CAPTCHA: pause for the user.
- Changed UI: stop before a credit-consuming click and ask the user.
- Changed credit cost or output count: refresh the approval before generating.
- Insufficient credits: report pending shot IDs and stop.
- Ambiguous submission: inspect project history; do not retry. If ambiguity remains, stop and ask.
- Chrome unavailable: hand the user the numbered prompts and deterministic `shots/shot-XX.mp4` download names for manual Flow operation.
