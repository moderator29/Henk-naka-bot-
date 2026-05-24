import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-user rate limits for AI endpoints (RPD §5.7 / §9.6). Backed by Upstash
 * Redis. When Upstash env isn't set the limiters are null and checkAILimit
 * allows the request (dev), so nothing crashes — production sets the keys.
 */

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

type Window = `${number} s` | `${number} m` | `${number} h` | `${number} d`;

function limiter(requests: number, window: Window) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "aurora-ai",
  });
}

export const aiLimits = {
  concierge: limiter(50, "1 d"),
  copilot: limiter(200, "1 d"),
  smartSearch: limiter(100, "1 h"),
  forecaster: limiter(20, "1 d"),
  subscriptionIntel: limiter(50, "1 d"),
} as const;

export type AIFeature = keyof typeof aiLimits;

export async function checkAILimit(
  feature: AIFeature,
  userId: string
): Promise<{ success: boolean; remaining: number }> {
  const rl = aiLimits[feature];
  if (!rl) return { success: true, remaining: Infinity };
  const res = await rl.limit(`${feature}:${userId}`);
  return { success: res.success, remaining: res.remaining };
}
