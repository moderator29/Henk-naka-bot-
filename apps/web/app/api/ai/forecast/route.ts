import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, aiNotConfiguredResponse, AI_MODEL } from "@/lib/ai/client";
import { FORECASTER_SYSTEM_PROMPT } from "@/lib/ai/prompts/forecaster";
import { getSessionUser } from "@/lib/auth/session";
import { checkAILimit } from "@/lib/ai/ratelimit";

/**
 * Earnings Forecaster narrative (AI feature). The statistical projection runs
 * client-side from real creator data; this endpoint produces the plain-language
 * read over those numbers with Claude. Auth-gated + rate-limited. Returns a
 * clean 503 (never a fake narrative) until ANTHROPIC_API_KEY is configured.
 */

const bodySchema = z.object({
  base: z.number().finite(),
  subGrowth: z.number().finite().optional(),
  tipGrowth: z.number().finite().optional(),
  churn: z.number().finite().optional(),
  projected: z.array(z.number().finite()).min(1).max(24),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = await checkAILimit("forecaster", user.id);
  if (!limit.success) {
    return NextResponse.json({ ok: false, error: "Daily limit reached." }, { status: 429 });
  }

  const anthropic = getAnthropic();
  if (!anthropic) return aiNotConfiguredResponse();

  let data;
  try {
    data = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const pct = (n?: number) => (n == null ? "n/a" : `${Math.round(n * 100)}%`);
  const userMessage = [
    `Current monthly baseline: ${Math.round(data.base)} $NSFW.`,
    `Assumptions, monthly subscriber growth ${pct(data.subGrowth)}, tip growth ${pct(
      data.tipGrowth
    )}, churn ${pct(data.churn)}.`,
    `Projected monthly $NSFW for the next ${data.projected.length} months: ${data.projected
      .map((n) => Math.round(n))
      .join(", ")}.`,
  ].join("\n");

  try {
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 300,
      temperature: 0.6,
      system: FORECASTER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = msg.content.find((b) => b.type === "text");
    return NextResponse.json({
      ok: true,
      narrative:
        text && text.type === "text"
          ? text.text.trim()
          : "The forecast narrative isn't available right now.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Couldn't generate the forecast. Try again." },
      { status: 502 }
    );
  }
}
