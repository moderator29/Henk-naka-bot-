import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Short-lived "this visitor passed the human check" proof.
 *
 * The full-page verify gate runs a real Turnstile challenge once, then this
 * sets a signed, HttpOnly cookie. Sign-up and sign-in trust that cookie instead
 * of demanding a second challenge, which is how mainstream platforms behave:
 * verify once, then let the user complete the form. The cookie is HMAC-signed
 * (so it cannot be forged) and expires quickly.
 */

export const HUMAN_COOKIE = "aurora_human";
const TTL_SECONDS = 30 * 60;

function signingSecret(): string {
  // Falls back to a constant only when Turnstile is not configured (dev), in
  // which case the challenge is a passthrough anyway.
  return process.env.TURNSTILE_SECRET_KEY ?? "aurora-dev-human-check";
}

function sign(exp: number): string {
  return createHmac("sha256", signingSecret()).update(String(exp)).digest("hex");
}

/** Mint a signed token of the form `<expiryMs>.<hmac>`. */
export function makeHumanToken(): string {
  const exp = Date.now() + TTL_SECONDS * 1000;
  return `${exp}.${sign(exp)}`;
}

export function isValidHumanToken(value: string | undefined | null): boolean {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot < 1) return false;
  const exp = Number(value.slice(0, dot));
  const sig = value.slice(dot + 1);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = sign(exp);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Read the request cookies and report whether the visitor is human-verified. */
export function hasHumanVerified(): boolean {
  return isValidHumanToken(cookies().get(HUMAN_COOKIE)?.value);
}

export const HUMAN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL_SECONDS,
};
