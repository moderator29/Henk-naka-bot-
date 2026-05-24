import Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic client (server-only). Every AI feature routes through /api/ai/*;
 * the browser never talks to Anthropic directly (RPD §5.7).
 *
 * The client is created lazily so importing this module never throws at build
 * time. Call getAnthropic() inside a handler, it returns null when
 * ANTHROPIC_API_KEY isn't set, and the route responds with a clear 503 rather
 * than faking a completion.
 */

export const AI_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!cached) cached = new Anthropic({ apiKey });
  return cached;
}

export function aiNotConfiguredResponse(): Response {
  return new Response(
    JSON.stringify({
      error:
        "AI is not configured yet. Set ANTHROPIC_API_KEY to enable this feature.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

/** Shared generation defaults; features override per call. */
export const DEFAULT_AI_CONFIG = {
  model: AI_MODEL,
  max_tokens: 1024,
  temperature: 0.7,
} as const;
