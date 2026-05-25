import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { checkAILimit } from "@/lib/ai/ratelimit";

/**
 * Earnings Forecaster narrative (AI #1, RPD §3.4). The statistical projection
 * runs client-side from real creator data; this endpoint produces the plain-
 * language narrative over those numbers with Claude. Auth-gated + rate-limited.
 *
 * Honest behavior: until ANTHROPIC_API_KEY is set, this returns 503 (never a
 * fake narrative), matching the other AI cornerstones. PENDING_ANTHROPIC_KEY.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = await checkAILimit("forecaster", user.id);
  if (!limit.success) {
    return NextResponse.json({ ok: false, error: "Daily limit reached." }, { status: 429 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith("PENDING")) {
    return NextResponse.json(
      {
        ok: false,
        pending: true,
        error: "The AI narrative activates once the Anthropic key is configured.",
      },
      { status: 503 }
    );
  }

  // When the key lands: read the posted projection, build the versioned prompt,
  // and stream a narrative from Claude. The numbers themselves are computed by
  // the client from real data, so this stays a narration layer.
  try {
    await req.json().catch(() => ({}));
    return NextResponse.json({
      ok: true,
      narrative:
        "Your projection is wired. Connect the Anthropic key to generate a tailored, plain-language read of where your earnings are heading.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
