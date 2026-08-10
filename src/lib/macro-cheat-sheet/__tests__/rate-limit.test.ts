import { createHmac } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RateLimitUnavailableError,
  checkMacroCheatSheetRateLimit,
} from "@/lib/macro-cheat-sheet/rate-limit";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: () => ({ rpc: mocks.rpc }),
}));

const originalSecret = process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET;
const TEST_SECRET = "0123456789abcdef0123456789abcdef";

describe("macro cheat sheet distributed rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET = TEST_SECRET;
    mocks.rpc.mockResolvedValue({
      data: [{ allowed: true, retry_after_seconds: 0 }],
      error: null,
    });
  });

  afterEach(() => vi.useRealTimers());

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET;
    } else {
      process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET = originalSecret;
    }
  });

  it("sends only keyed hashes and fixed server-side windows to the RPC", async () => {
    const result = await checkMacroCheatSheetRateLimit({
      normalizedEmail: "reader@example.com",
      ipAddress: "203.0.113.9",
    });

    expect(result).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(mocks.rpc).toHaveBeenCalledWith(
      "consume_macro_cheat_sheet_rate_limit",
      {
        p_ip_hash: createHmac("sha256", TEST_SECRET)
          .update("ip:203.0.113.9")
          .digest("hex"),
        p_email_hash: createHmac("sha256", TEST_SECRET)
          .update("email:reader@example.com")
          .digest("hex"),
        p_ip_limit: 10,
        p_ip_window_seconds: 900,
        p_email_limit: 3,
        p_email_window_seconds: 3_600,
      },
    );
  });

  it("returns the database retry window when either distributed limit is full", async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ allowed: false, retry_after_seconds: 731 }],
      error: null,
    });

    await expect(
      checkMacroCheatSheetRateLimit({
        normalizedEmail: "reader@example.com",
        ipAddress: "203.0.113.9",
      }),
    ).resolves.toEqual({ allowed: false, retryAfterSeconds: 731 });
  });

  it("fails closed when keyed hashing is not configured", async () => {
    delete process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET;

    await expect(
      checkMacroCheatSheetRateLimit({
        normalizedEmail: "reader@example.com",
        ipAddress: "203.0.113.9",
      }),
    ).rejects.toBeInstanceOf(RateLimitUnavailableError);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed when the keyed-hash secret is shorter than 32 bytes", async () => {
    process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET = "too-short";

    await expect(
      checkMacroCheatSheetRateLimit({
        normalizedEmail: "reader@example.com",
        ipAddress: "203.0.113.9",
      }),
    ).rejects.toBeInstanceOf(RateLimitUnavailableError);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed on an invalid RPC payload or database error", async () => {
    mocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "database unavailable" },
    });

    await expect(
      checkMacroCheatSheetRateLimit({
        normalizedEmail: "reader@example.com",
        ipAddress: "203.0.113.9",
      }),
    ).rejects.toBeInstanceOf(RateLimitUnavailableError);

    mocks.rpc.mockResolvedValueOnce({ data: [], error: null });
    await expect(
      checkMacroCheatSheetRateLimit({
        normalizedEmail: "reader@example.com",
        ipAddress: "203.0.113.9",
      }),
    ).rejects.toBeInstanceOf(RateLimitUnavailableError);
  });

  it("fails closed when the distributed decision misses its deadline", async () => {
    vi.useFakeTimers();
    mocks.rpc.mockReturnValue(new Promise(() => {}));

    const result = checkMacroCheatSheetRateLimit({
      normalizedEmail: "reader@example.com",
      ipAddress: "203.0.113.9",
    });
    const unavailable = expect(result).rejects.toBeInstanceOf(
      RateLimitUnavailableError,
    );
    await vi.advanceTimersByTimeAsync(1_500);

    await unavailable;
  });
});
