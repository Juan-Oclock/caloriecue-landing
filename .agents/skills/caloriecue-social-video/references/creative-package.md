# Creative Package Contract

Read this file before drafting any CalorieCue social-video package.

## Source analysis

Extract:

- The article’s single most surprising or useful idea.
- Three to six facts that can be understood without seeing a table.
- Qualifications needed to avoid misleading health or nutrition claims.
- The practical action the viewer should take.
- The most relevant CalorieCue CTA.

Do not turn a ranked article into a spoken list of every entry. Build one argument with a hook, explanation, examples, application, and CTA.

## Narration

Write 130–165 words for a typical 60–75 second read. Use the voice “warm, confident wellness educator” unless the user changes it.

Use this progression:

1. Hook: challenge a familiar assumption in the first two seconds.
2. Answer: state the article’s core idea plainly.
3. Evidence: use a few memorable examples from the article.
4. Nuance: prevent the comparison from becoming an absolute good/bad claim.
5. Application: give a simple behavior the viewer can use today.
6. CTA: invite the viewer to save/read and use CalorieCue.

Write numbers for speech, not tables. Prefer “about twenty-three grams” to “23.5g” unless the exact decimal is essential.

## Shot design

Default to eight 8-second shots. Each shot must have one visual purpose and one primary movement.

A Veo prompt should specify:

- Subject and environment.
- Camera framing and motion.
- Subject motion.
- Lighting, texture, and visual style.
- Vertical composition and safe center framing.
- Continuity details when a recurring person or prop appears.
- Negative direction: no readable text, captions, logos, watermarks, dialogue, narration, or music.

Do not ask Veo to display nutrition numbers, CalorieCue UI, phone-screen text, or brand typography. Put these requirements in brief.md as separate editor overlays or supplied mockups.

## Creative files

brief.md contains:

- Article URL and source path.
- Audience and objective.
- Hook and key takeaway.
- Claims used and where they appear in the article.
- Visual direction, recurring style, and CTA treatment.
- Any real screenshots, phone mockups, logos, or overlays the editor should use.

narration-script.txt contains only the approved spoken words.

social-copy.md contains separate Instagram, TikTok, and Facebook descriptions followed by focused hashtags.

manifest.json is the machine-readable generation contract:

~~~json
{
  "version": 1,
  "articleUrl": "https://caloriecue.app/blog/example-slug",
  "slug": "example-slug",
  "targetDurationSeconds": 64,
  "narration": "The complete narration text.",
  "socialCopy": {
    "instagram": "Instagram description",
    "tiktok": "TikTok description",
    "facebook": "Facebook description",
    "hashtags": ["#CalorieCue", "#Nutrition"]
  },
  "veo": {
    "model": "veo-3.1-fast-generate-preview",
    "aspectRatio": "9:16",
    "resolution": "1080p",
    "durationSeconds": 8
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
    {
      "id": 1,
      "title": "Hook",
      "purpose": "Create the first visual contrast",
      "prompt": "A complete Veo prompt of at least forty characters."
    }
  ]
}
~~~

Add enough shots for the target duration. Use sequential positive integer IDs and keep every prompt self-contained.

## Approval sheet

Present, in order:

1. Hook and creative direction.
2. Narration word count and full script.
3. Shot table with ID, purpose, and prompt.
4. ElevenLabs voice ID or name.
5. Platform descriptions and hashtags.
6. Veo model, resolution, shot count, calculated estimate, and hard budget.
7. A direct question asking whether to spend up to that budget.

Do not collapse the prompts behind a summary; the user must be able to review what will be purchased.

## Handoff checklist

- generation-report.json has no unresolved submitted or polling operation.
- Every successful shot has a non-empty MP4 file.
- narration.mp3, alignment.json, and subtitles.srt are non-empty.
- The narration text matches the text used for forced alignment.
- Failed or rejected shots are listed by ID.
- No secret appears in any file.
- No final edit or public post was created.
