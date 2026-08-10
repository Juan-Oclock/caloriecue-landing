export class PdfRenderTimeoutError extends Error {
  constructor() {
    super("Macro cheat sheet PDF rendering timed out");
    this.name = "PdfRenderTimeoutError";
  }
}

export class PdfRenderCircuitOpenError extends Error {
  constructor() {
    super("Macro cheat sheet PDF rendering is temporarily unavailable");
    this.name = "PdfRenderCircuitOpenError";
  }
}

type PdfRenderCoordinatorOptions = {
  render: () => Promise<Buffer>;
  timeoutMs: number;
  circuitCooldownMs: number;
  now?: () => number;
};

export function createPdfRenderCoordinator({
  render,
  timeoutMs,
  circuitCooldownMs,
  now = Date.now,
}: PdfRenderCoordinatorOptions) {
  let cachedBuffer: Buffer | null = null;
  let inFlight: Promise<Buffer> | null = null;
  let circuitOpenUntil = 0;

  function sharedRender(): Promise<Buffer> {
    if (!inFlight) {
      const pending = Promise.resolve()
        .then(render)
        .then((buffer) => {
          cachedBuffer = buffer;
          circuitOpenUntil = 0;
          return buffer;
        })
        .catch((error: unknown) => {
          circuitOpenUntil = now() + circuitCooldownMs;
          throw error;
        })
        .finally(() => {
          if (inFlight === pending) inFlight = null;
        });

      // Callers can time out while the underlying renderer continues. Keep its
      // eventual rejection observed even when no timed caller remains attached.
      pending.catch(() => undefined);
      inFlight = pending;
    }

    return inFlight;
  }

  async function renderWithinDeadline(): Promise<Buffer> {
    if (cachedBuffer) return cachedBuffer;
    if (now() < circuitOpenUntil) throw new PdfRenderCircuitOpenError();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        circuitOpenUntil = now() + circuitCooldownMs;
        reject(new PdfRenderTimeoutError());
      }, timeoutMs);
    });

    try {
      return await Promise.race([sharedRender(), timeout]);
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  return { render: renderWithinDeadline };
}
