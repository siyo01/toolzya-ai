// src/utils/ratelimit.ts
const requests = new Map<string, { count: number; timestamp: number }>();

/**
 * Simple per-IP rate limiter.
 * - ip: string
 * - limit: number of requests allowed per window
 * - windowMs: window in milliseconds
 *
 * NOTE: This in-memory approach resets on cold-start and is not ideal for distributed
 * serverless. For production use a shared store (Redis, KV).
 */
export function rateLimit(ip: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record) {
    requests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > windowMs) {
    requests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}
