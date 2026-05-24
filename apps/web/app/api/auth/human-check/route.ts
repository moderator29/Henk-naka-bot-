import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/auth/turnstile";
import {
  HUMAN_COOKIE,
  HUMAN_COOKIE_OPTIONS,
  makeHumanToken,
} from "@/lib/auth/human-check";

/**
 * The verify gate posts its Turnstile token here. We run the real server-side
 * siteverify once and, on success, set a signed short-lived cookie so the
 * sign-up / sign-in forms don't have to challenge the user a second time.
 */
export async function POST(req: Request) {
  let token = "";
  try {
    const body = (await req.json()) as { token?: string };
    token = typeof body.token === "string" ? body.token : "";
  } catch {
    // empty body is fine; verifyTurnstile will decide based on config
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const result = await verifyTurnstile(token, ip);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "Verification failed." },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(HUMAN_COOKIE, makeHumanToken(), HUMAN_COOKIE_OPTIONS);
  return res;
}
