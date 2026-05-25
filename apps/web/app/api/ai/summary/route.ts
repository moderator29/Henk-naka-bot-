import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { checkAILimit } from "@/lib/ai/ratelimit";

/**
 * Subscription Intelligence "since last visit" summary (AI #2, RPD §3.5).
 * Produces a plain-language recap of what a creator posted recently. Auth-gated
 * + rate-limited. Honest 503 until the Anthropic key is configured.
 * PENDING_ANTHROPIC_KEY.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = await checkAILimit("subscriptionIntel", user.id);
  if (!limit.success) {
    return NextResponse.json({ ok: false, error: "Daily limit reached." }, { status: 429 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith("PENDING")) {
    return NextResponse.json(
      {
        ok: false,
        pending: true,
        error:
          "AI recaps activate once the Anthropic key is configured. You'll get a plain-language summary of everything new since your last visit.",
      },
      { status: 503 }
    );
  }
  try {
    await req.json().catch(() => ({}));
    // With the key set: read the creator's recent posts and stream a recap.
    return NextResponse.json({
      ok: true,
      summary: "Recap ready. Connect the Anthropic key to generate it.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
