import { readFile } from "node:fs/promises";
import path from "node:path";

export function parseEnvironmentFile(contents) {
  const values = {};

  for (const rawLine of String(contents).split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalized = line.startsWith("export ")
      ? line.slice("export ".length).trim()
      : line;
    const separator = normalized.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = normalized.slice(0, separator).trim();
    let value = normalized.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key)) {
      values[key] = value;
    }
  }

  return values;
}

export async function loadEnvironment({
  cwd = process.cwd(),
  env = process.env,
  fileName = ".env.local",
} = {}) {
  let fromFile = {};
  try {
    const contents = await readFile(path.join(cwd, fileName), "utf8");
    fromFile = parseEnvironmentFile(contents);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  return {
    ...fromFile,
    ...env,
  };
}

export function missingEnvironmentVariables(env, names) {
  return names.filter(
    (name) =>
      typeof env?.[name] !== "string" || env[name].trim().length === 0,
  );
}
