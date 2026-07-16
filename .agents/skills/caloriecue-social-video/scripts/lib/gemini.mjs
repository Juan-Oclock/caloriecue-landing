import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";

function redact(value, secrets = []) {
  let result = String(value);
  for (const secret of secrets) {
    if (typeof secret === "string" && secret.length > 0) {
      result = result.split(secret).join("[REDACTED]");
    }
  }
  return result;
}

async function apiError(response, service, secrets) {
  let message = response.status + " " + response.statusText;

  try {
    const body = await response.json();
    message = body?.error?.message || body?.message || message;
  } catch {
    // Preserve the status message when the provider returns non-JSON data.
  }

  return new Error(
    service + " request failed: " + redact(message, secrets),
  );
}

function headers(apiKey, additions = {}) {
  return {
    "x-goog-api-key": apiKey,
    ...additions,
  };
}

export async function listVeoModels({
  apiKey,
  fetchImpl = globalThis.fetch,
  baseUrl = GEMINI_BASE_URL,
}) {
  const models = [];
  let pageToken;

  do {
    const url = new URL(baseUrl + "/models");
    url.searchParams.set("pageSize", "1000");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetchImpl(url.toString(), {
      headers: headers(apiKey),
    });
    if (!response.ok) {
      throw await apiError(response, "Gemini", [apiKey]);
    }

    const body = await response.json();
    models.push(...(body.models || []));
    pageToken = body.nextPageToken;
  } while (pageToken);

  return models
    .filter((model) => {
      const name = String(model.name || "");
      const methods = model.supportedGenerationMethods || [];
      return (
        name.includes("/veo-3.1-") &&
        methods.includes("predictLongRunning")
      );
    })
    .map((model) => model.name.replace(/^models\//u, ""))
    .sort();
}

export async function submitVeoShot({
  apiKey,
  model,
  prompt,
  aspectRatio,
  resolution,
  durationSeconds,
  fetchImpl = globalThis.fetch,
  baseUrl = GEMINI_BASE_URL,
}) {
  const url =
    baseUrl +
    "/models/" +
    encodeURIComponent(model) +
    ":predictLongRunning";
  const response = await fetchImpl(url, {
    method: "POST",
    headers: headers(apiKey, {
      "content-type": "application/json",
    }),
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        aspectRatio,
        resolution,
        durationSeconds,
        numberOfVideos: 1,
      },
    }),
  });

  if (!response.ok) {
    throw await apiError(response, "Gemini Veo submission", [apiKey]);
  }

  const operation = await response.json();
  if (!operation?.name) {
    throw new Error("Gemini Veo submission returned no operation name");
  }

  return operation;
}

export async function pollVeoOperation({
  apiKey,
  operationName,
  fetchImpl = globalThis.fetch,
  baseUrl = GEMINI_BASE_URL,
  pollIntervalMs = 10_000,
  maxPolls = 72,
  sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  onPoll,
}) {
  if (
    typeof operationName !== "string" ||
    !operationName.startsWith("operations/")
  ) {
    throw new Error("Invalid Gemini Veo operation name");
  }

  for (let poll = 1; poll <= maxPolls; poll += 1) {
    const response = await fetchImpl(baseUrl + "/" + operationName, {
      headers: headers(apiKey),
    });
    if (!response.ok) {
      throw await apiError(response, "Gemini Veo polling", [apiKey]);
    }

    const operation = await response.json();
    if (typeof onPoll === "function") {
      await onPoll(operation, poll);
    }

    if (operation.error) {
      const message =
        operation.error.message ||
        JSON.stringify(operation.error) ||
        "unknown operation error";
      throw new Error(
        "Gemini Veo operation failed: " + redact(message, [apiKey]),
      );
    }

    if (operation.done) {
      return operation;
    }

    if (poll < maxPolls) {
      await sleep(pollIntervalMs);
    }
  }

  throw new Error(
    "Gemini Veo operation did not finish within the polling limit: " +
      operationName,
  );
}

export function getVeoVideoUri(operation) {
  const uri =
    operation?.response?.generateVideoResponse?.generatedSamples?.[0]?.video
      ?.uri;
  if (!uri) {
    throw new Error("Completed Gemini Veo operation returned no video URI");
  }
  return uri;
}

export async function downloadVeoVideo({
  apiKey,
  videoUri,
  outputPath,
  fetchImpl = globalThis.fetch,
}) {
  const response = await fetchImpl(videoUri, {
    headers: headers(apiKey),
    redirect: "follow",
  });

  if (!response.ok) {
    throw await apiError(response, "Gemini Veo download", [apiKey]);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);

  return {
    outputPath,
    bytes: bytes.length,
  };
}
