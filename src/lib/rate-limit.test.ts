import { describe, it, expect } from "vitest";
import { checkRate, type RateBuckets } from "./rate-limit";

// The rate limiter guards /api/auth/login and /api/auth/register against
// brute-force attempts. Pure seam: buckets + now are injected so the suite
// needs no timers and no server.

describe("checkRate (fixed window per key)", () => {
  function fresh(): RateBuckets {
    return new Map();
  }

  it("allows requests up to the limit within one window", () => {
    const buckets = fresh();
    for (let i = 0; i < 5; i++) {
      const r = checkRate(buckets, "ip-a", 5, 60_000, 1_000_000);
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const buckets = fresh();
    for (let i = 0; i < 5; i++) checkRate(buckets, "ip-a", 5, 60_000, 1_000_000);
    const r = checkRate(buckets, "ip-a", 5, 60_000, 1_000_000);
    expect(r.allowed).toBe(false);
  });

  it("reports when the window resets (retryAfter seconds)", () => {
    const buckets = fresh();
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) checkRate(buckets, "ip-a", 5, 60_000, start);
    const blocked = checkRate(buckets, "ip-a", 5, 60_000, start + 10_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(50);
  });

  it("resets the counter after the window elapses", () => {
    const buckets = fresh();
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) checkRate(buckets, "ip-a", 5, 60_000, start);
    const after = checkRate(buckets, "ip-a", 5, 60_000, start + 60_001);
    expect(after.allowed).toBe(true);
  });

  it("keeps keys independent", () => {
    const buckets = fresh();
    for (let i = 0; i < 5; i++) checkRate(buckets, "ip-a", 5, 60_000, 1_000_000);
    const other = checkRate(buckets, "ip-b", 5, 60_000, 1_000_000);
    expect(other.allowed).toBe(true);
  });

  it("counts a blocked attempt (no free retries by hammering)", () => {
    const buckets = fresh();
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) checkRate(buckets, "ip-a", 5, 60_000, start);
    checkRate(buckets, "ip-a", 5, 60_000, start + 1_000); // blocked
    const still = checkRate(buckets, "ip-a", 5, 60_000, start + 2_000);
    expect(still.allowed).toBe(false);
  });

  it("evicts expired buckets so memory does not grow unbounded", () => {
    const buckets = fresh();
    checkRate(buckets, "old-ip", 1, 60_000, 1_000_000);
    checkRate(buckets, "new-ip", 1, 10 * 60_000, 100 * 60_000);
    expect(buckets.has("old-ip")).toBe(false);
    expect(buckets.has("new-ip")).toBe(true);
  });
});
