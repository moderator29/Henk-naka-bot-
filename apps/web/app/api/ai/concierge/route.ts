import { NextRequest } from "next/server";
import {
  getAnthropic,
  aiNotConfiguredResponse,
  AI_MODEL,
} from "@/lib/ai/client";
import { CONCIERGE_SYSTEM_PROMPT } from "@/lib/ai/prompts/concierge";
import { chatMessagesSchema } from "@/lib/ai/schemas";
import { checkAILimit } from "@/lib/ai/ratelimit";
import { streamToSSE } from "@/lib/ai/sse";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Discovery Concierge chat — streams Aura's responses as SSE. Auth-gated,
 * rate-limited, validated. Returns 503 (not a fake reply) when ANTHROPIC_API_KEY
 * isn't set.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const limit = await checkAILimit("concierge", user.id);
  if (!limit.success) {
    return new Response("Daily limit reached. Try again tomorrow.", {
      status: 429,
    });
  }

  const anthropic = getAnthropic();
  if (!anthropic) return aiNotConfiguredResponse();

  let messages;
  try {
    const body = await req.json();
    messages = chatMessagesSchema.parse(body.messages);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const stream = anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: 1024,
    temperature: 0.8,
    system: CONCIERGE_SYSTEM_PROMPT,
    messages,
  });

  return streamToSSE(stream);
}
