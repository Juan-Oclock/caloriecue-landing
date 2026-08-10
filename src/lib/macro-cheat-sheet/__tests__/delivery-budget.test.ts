import { describe, expect, it } from "vitest";
import {
  CLIENT_REQUEST_TIMEOUT_MS,
  SERVER_REQUEST_BUDGET_MS,
  TRANSPORT_MARGIN_MS,
} from "@/lib/macro-cheat-sheet/delivery-budget";

describe("macro cheat sheet end-to-end delivery budget", () => {
  it("leaves an explicit transport margin after the full server budget", () => {
    expect(SERVER_REQUEST_BUDGET_MS).toBe(12_000);
    expect(TRANSPORT_MARGIN_MS).toBe(3_000);
    expect(CLIENT_REQUEST_TIMEOUT_MS).toBe(15_000);
    expect(CLIENT_REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(
      SERVER_REQUEST_BUDGET_MS + TRANSPORT_MARGIN_MS,
    );
  });
});
