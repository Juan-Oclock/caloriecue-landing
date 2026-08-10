export const SERVER_REQUEST_BUDGET_MS = 12_000;
export const TRANSPORT_MARGIN_MS = 3_000;
export const CLIENT_REQUEST_TIMEOUT_MS =
  SERVER_REQUEST_BUDGET_MS + TRANSPORT_MARGIN_MS;

export const RATE_LIMIT_STAGE_BUDGET_MS = 1_500;
export const PDF_RENDER_STAGE_BUDGET_MS = 5_000;
export const CONTACT_STAGE_BUDGET_MS = 1_000;
export const RESEND_STAGE_BUDGET_MS = 8_000;

export const UNCERTAIN_DELIVERY_MESSAGE =
  "We could not confirm delivery. Check your inbox before retrying.";

export class ServerRequestBudgetExceededError extends Error {
  constructor(stage: string) {
    super(`Macro cheat sheet ${stage} exceeded the server request budget`);
    this.name = "ServerRequestBudgetExceededError";
  }
}

export class ServerRequestBudget {
  private readonly deadlineAt: number;

  constructor(startedAt = Date.now()) {
    this.deadlineAt = startedAt + SERVER_REQUEST_BUDGET_MS;
  }

  remainingMs(stageBudgetMs = SERVER_REQUEST_BUDGET_MS): number {
    return Math.max(
      0,
      Math.min(stageBudgetMs, this.deadlineAt - Date.now()),
    );
  }

  async run<T>(
    stage: string,
    stageBudgetMs: number,
    operation: () => PromiseLike<T> | T,
    timeoutError: () => Error = () =>
      new ServerRequestBudgetExceededError(stage),
  ): Promise<T> {
    const timeoutMs = this.remainingMs(stageBudgetMs);
    if (timeoutMs <= 0) throw timeoutError();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(timeoutError()), timeoutMs);
    });

    try {
      return await Promise.race([
        Promise.resolve().then(operation),
        timeout,
      ]);
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }
}
