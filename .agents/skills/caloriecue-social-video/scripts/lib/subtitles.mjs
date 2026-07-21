function finiteNonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

export function formatSrtTimestamp(seconds) {
  if (!finiteNonNegative(seconds)) {
    throw new Error("SRT timestamp must be a non-negative number");
  }

  const totalMilliseconds = Math.round(seconds * 1000);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const wholeSeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(wholeSeconds).padStart(2, "0") +
    "," +
    String(milliseconds).padStart(3, "0")
  );
}

function wrapCaption(text, maxLineCharacters) {
  const words = text.split(/\s+/u);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (line && candidate.length > maxLineCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    lines.push(line);
  }
  return lines.join("\n");
}

function normalizeTimedWords(alignment) {
  if (!Array.isArray(alignment?.words)) {
    return [];
  }

  return alignment.words
    .map((word) => ({
      text: String(word.text ?? word.word ?? "").trim(),
      start: Number(word.start),
      end: Number(word.end),
    }))
    .filter(
      (word) =>
        word.text &&
        finiteNonNegative(word.start) &&
        finiteNonNegative(word.end) &&
        word.end >= word.start,
    );
}

function groupWords(words, maxCharacters, maxDurationSeconds) {
  const groups = [];
  let group = [];

  const flush = () => {
    if (group.length > 0) {
      groups.push(group);
      group = [];
    }
  };

  for (const word of words) {
    if (group.length === 0) {
      group.push(word);
      continue;
    }

    const candidateText = [...group, word]
      .map((item) => item.text)
      .join(" ");
    const candidateDuration = word.end - group[0].start;

    if (
      candidateText.length > maxCharacters ||
      candidateDuration > maxDurationSeconds
    ) {
      flush();
    }
    group.push(word);
  }

  flush();
  return groups;
}

export function alignmentToSrt(
  alignment,
  {
    maxCharacters = 42,
    maxDurationSeconds = 3,
    maxLineCharacters = 24,
  } = {},
) {
  const words = normalizeTimedWords(alignment);
  if (words.length === 0) {
    throw new Error("Alignment must contain timed words");
  }

  const groups = groupWords(
    words,
    maxCharacters,
    maxDurationSeconds,
  );
  const output = [];

  for (const [index, group] of groups.entries()) {
    const text = group.map((word) => word.text).join(" ");
    output.push(String(index + 1));
    output.push(
      formatSrtTimestamp(group[0].start) +
        " --> " +
        formatSrtTimestamp(group[group.length - 1].end),
    );
    output.push(wrapCaption(text, maxLineCharacters));
    output.push("");
  }

  return output.join("\n");
}
