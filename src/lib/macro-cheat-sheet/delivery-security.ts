import { createHmac } from "node:crypto";

const MINIMUM_SECRET_BYTES = 32;
const DELIVERY_CAMPAIGN = "macro-cheat-sheet";
const DELIVERY_VERSION = "v1";

export class MacroCheatSheetSecretUnavailableError extends Error {
  constructor() {
    super(
      `MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET must contain at least ${MINIMUM_SECRET_BYTES} bytes`,
    );
    this.name = "MacroCheatSheetSecretUnavailableError";
  }
}

export function getMacroCheatSheetSecret(): string {
  const secret = process.env.MACRO_CHEAT_SHEET_RATE_LIMIT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < MINIMUM_SECRET_BYTES) {
    throw new MacroCheatSheetSecretUnavailableError();
  }
  return secret;
}

export function createDeliveryIdempotencyKey({
  normalizedEmail,
}: {
  normalizedEmail: string;
}): string {
  const digest = createHmac("sha256", getMacroCheatSheetSecret())
    .update(
      `delivery:${DELIVERY_CAMPAIGN}:${DELIVERY_VERSION}:${normalizedEmail.trim().toLowerCase()}`,
    )
    .digest("hex");

  return `${DELIVERY_CAMPAIGN}/${DELIVERY_VERSION}/${digest}`;
}
