import assert from "node:assert/strict";
import test from "node:test";

import {
  alignmentToSrt,
  formatSrtTimestamp,
} from "../lib/subtitles.mjs";

test("formats SRT timestamps with millisecond precision", () => {
  assert.equal(formatSrtTimestamp(0), "00:00:00,000");
  assert.equal(formatSrtTimestamp(61.234), "00:01:01,234");
  assert.equal(formatSrtTimestamp(3661.999), "01:01:01,999");
});

test("groups aligned words into readable caption cues", () => {
  const srt = alignmentToSrt(
    {
      words: [
        { text: "Protein", start: 0, end: 0.4 },
        { text: "per", start: 0.45, end: 0.7 },
        { text: "calorie", start: 0.75, end: 1.2 },
        { text: "makes", start: 1.3, end: 1.6 },
        { text: "comparisons", start: 1.7, end: 2.0 },
        { text: "easier.", start: 2.1, end: 2.4 },
      ],
    },
    {
      maxCharacters: 30,
      maxDurationSeconds: 1,
      maxLineCharacters: 12,
    },
  );

  assert.equal(
    srt,
    [
      "1",
      "00:00:00,000 --> 00:00:00,700",
      "Protein per",
      "",
      "2",
      "00:00:00,750 --> 00:00:01,600",
      "calorie",
      "makes",
      "",
      "3",
      "00:00:01,700 --> 00:00:02,400",
      "comparisons",
      "easier.",
      "",
    ].join("\n"),
  );
});

test("rejects alignment data without timed words", () => {
  assert.throws(() => alignmentToSrt({ words: [] }), /timed words/);
});
