import { createHmac } from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const RATE_LIMIT_DEADLINE_MS = 1_500;
const IP_LIMIT = 10;
const IP_WINDOW_SECONDS = 15 * 60;
const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_SECONDS = 60 * 60;

export class RateLimitUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Macro cheat sheet rate limiting is unavailable", { cause });
    this.name = "RateLimitUnavailableError";
  }
}

function keyedHash(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export async function checkMacroCheatSheetRateLimit({
  normalizedEmail,
  ipAddress,
}: {
  normalizedEmail: string;
  ipAddress: string;
}): Promise<RateLimitDecision> {
  const secret = process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET;
  if (!secret) throw new RateLimitUnavailableError();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new RateLimitUnavailableError()),
      RATE_LIMIT_DEADLINE_MS,
    );
  });

  try {
    const rpc = createServiceRoleClient().rpc(
      "consume_macro_cheat_sheet_rate_limit",
      {
        p_ip_hash: keyedHash(secret, `ip:${ipAddress}`),
        p_email_hash: keyedHash(secret, `email:${normalizedEmail}`),
        p_ip_limit: IP_LIMIT,
        p_ip_window_seconds: IP_WINDOW_SECONDS,
        p_email_limit: EMAIL_LIMIT,
        p_email_window_seconds: EMAIL_WINDOW_SECONDS,
      },
    );
    const result = await Promise.race([rpc, deadline]);

    if (result.error) throw result.error;
    const row = Array.isArray(result.data) ? result.data[0] : null;
    if (
      !row ||
      typeof row.allowed !== "boolean" ||
      typeof row.retry_after_seconds !== "number" ||
      !Number.isFinite(row.retry_after_seconds) ||
      row.retry_after_seconds < 0
    ) {
      throw new Error("Invalid rate-limit RPC response");
    }

    return {
      allowed: row.allowed,
      retryAfterSeconds: Math.ceil(row.retry_after_seconds),
    };
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) throw error;
    throw new RateLimitUnavailableError(error);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
