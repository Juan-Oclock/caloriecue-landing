const attempts = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const CONFIGS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },       // 5 attempts per 15 min
  snapshot: { maxAttempts: 1, windowMs: 60 * 1000 },           // 1 trigger per minute
};

export function checkRateLimit(
  type: keyof typeof CONFIGS,
  identifier: string
): { allowed: boolean; retryAfterMs?: number } {
  const config = CONFIGS[type];
  if (!config) return { allowed: true };

  const key = `${type}:${identifier}`;
  const now = Date.now();
  const entry = attempts.get(key);

  // Clean expired entry
  if (entry && now > entry.resetAt) {
    attempts.delete(key);
  }

  const current = attempts.get(key);

  if (!current) {
    attempts.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (current.count >= config.maxAttempts) {
    return { allowed: false, retryAfterMs: current.resetAt - now };
  }

  current.count++;
  return { allowed: true };
}

export function resetRateLimit(type: string, identifier: string): void {
  attempts.delete(`${type}:${identifier}`);
}
