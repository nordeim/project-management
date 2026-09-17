// Fixed-window rate limiter for the auth endpoints (brute-force mitigation,
// PAD §10 HIGH item). Pure seam: `checkRate` takes the bucket map and the
// current time so the spec needs no timers; route handlers pass a module
// singleton and `Date.now()`. Scope: per-process (single-node deploy — see
// PAD §6.4; a multi-instance deployment would need a shared store).

export type RateBuckets = Map<string, { count: number; resetAt: number }>;

export interface RateDecision {
  allowed: boolean;
  /** Seconds until the window resets (0 when allowed). */
  retryAfterSec: number;
}

export function checkRate(
  buckets: RateBuckets,
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateDecision {
  // Opportunistic eviction: drop expired entries on every call so the map
  // cannot grow without bound under key churn (test pins this).
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/** Module-level bucket store shared by all handlers in this process. */
const authBuckets: RateBuckets = new Map();

/**
 * Guard for /api/auth/*: 10 attempts per IP per 15 minutes. Returns null when
 * allowed, or the Retry-After seconds when the IP is throttled.
 */
export function authRateLimit(ip: string): number | null {
  const decision = checkRate(authBuckets, `auth:${ip}`, 10, 15 * 60_000, Date.now());
  return decision.allowed ? null : decision.retryAfterSec;
}

/** Best-effort client IP from proxy headers (single-node, trusted proxy assumed). */
export function clientIpOf(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
