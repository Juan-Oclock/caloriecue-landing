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
