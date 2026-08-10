import { createHmac } from "node:crypto";

const MINIMUM_SECRET_BYTES = 32;

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
  deliveryMode,
}: {
  normalizedEmail: string;
  deliveryMode: "attached" | "link_only";
}): string {
  const digest = createHmac("sha256", getMacroCheatSheetSecret())
    .update(
      `delivery:${normalizedEmail.trim().toLowerCase()}:${deliveryMode}`,
    )
    .digest("hex");

  return `macro-cheat-sheet/v1/${deliveryMode}/${digest}`;
}
