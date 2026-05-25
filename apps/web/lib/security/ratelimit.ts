import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * General-purpose rate limiter for sensitive endpoints (auth, upload, tips).
 * Uses Upstash when configured; otherwise falls back to an in-memory sliding
 * window so abuse protection is never fully off (best-effort per instance,
 * rather than the previous fail-open behavior).
 */

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

type Window = `${number} s` | `${number} m` | `${number} h` | `${number} d`;

const upstashLimiters = new Map<string, Ratelimit>();

function upstash(bucket: string, requests: number, window: Window): Ratelimit | null {
  if (!redis) return null;
  let rl = upstashLimiters.get(bucket);
  if (!rl) {
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `aurora-rl-${bucket}`,
    });
    upstashLimiters.set(bucket, rl);
  }
  return rl;
}

// In-memory fallback: timestamps per key, pruned on each call.
const memory = new Map<string, number[]>();

function memoryAllow(key: string, requests: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= requests) {
    memory.set(key, hits);
    return false;
  }
  hits.push(now);
  memory.set(key, hits);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (memory.size > 5000) {
    for (const [k, v] of memory) {
      if (v.every((t) => now - t > windowMs)) memory.delete(k);
    }
  }
  return true;
}

const WINDOW_MS: Record<"s" | "m" | "h" | "d", number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Returns true when the request is allowed. `id` should identify the actor
 * (user id, or IP for pre-auth endpoints).
 */
export async function rateLimit(
  bucket: string,
  id: string,
  requests: number,
  window: Window
): Promise<boolean> {
  const key = `${bucket}:${id}`;
  const rl = upstash(bucket, requests, window);
  if (rl) {
    const res = await rl.limit(key);
    return res.success;
  }
  const [n, unit] = window.split(" ") as [string, "s" | "m" | "h" | "d"];
  return memoryAllow(key, requests, Number(n) * WINDOW_MS[unit]);
}

/** Best-effort client IP from proxy headers, for pre-auth rate limiting. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
