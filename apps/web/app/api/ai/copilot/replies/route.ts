import { NextRequest, NextResponse } from "next/server";
import {
  getAnthropic,
  aiNotConfiguredResponse,
  AI_MODEL,
} from "@/lib/ai/client";
import { COPILOT_REPLY_PROMPT } from "@/lib/ai/prompts/copilot";
import { replySuggestionsSchema, chatMessagesSchema } from "@/lib/ai/schemas";
import { checkAILimit } from "@/lib/ai/ratelimit";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Creator Co-Pilot, DM reply suggestions (RPD §3.2). Wired to the REAL
 * /messages surface: the client passes the recent thread, we return 3 reply
 * options. Auth-gated, rate-limited, Zod-validated. 503 (not a fake) when the
 * AI key isn't configured.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const limit = await checkAILimit("copilot", user.id);
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const anthropic = getAnthropic();
  if (!anthropic) return aiNotConfiguredResponse();

  let messages;
  try {
    const body = await req.json();
    messages = chatMessagesSchema.parse(body.messages);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Fan" : "Creator"}: ${m.content}`)
      .join("\n");

    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      temperature: 0.7,
      system: COPILOT_REPLY_PROMPT,
      messages: [{ role: "user", content: transcript }],
    });

    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return NextResponse.json({ suggestions: [] });
    }
    const parsed = replySuggestionsSchema.safeParse(JSON.parse(text.text));
    return NextResponse.json({
      suggestions: parsed.success ? parsed.data : [],
    });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
