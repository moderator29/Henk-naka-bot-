/**
 * Cloudflare Turnstile server-side verification.
 *
 * verifyTurnstile(token) calls Cloudflare's siteverify endpoint with the
 * server secret. When TURNSTILE_SECRET_KEY isn't configured yet, it returns
 * { ok: true, skipped: true } so local/dev flows aren't blocked, but the path
 * is labeled PENDING_TURNSTILE_KEYS. In production with the key set, a missing
 * or invalid token fails closed.
 */

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // PENDING_TURNSTILE_KEYS, allow through in environments without the secret.
  if (!secret) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, error: "Verification required." };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(SITEVERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success
      ? { ok: true }
      : { ok: false, error: "Verification failed. Try again." };
  } catch {
    return { ok: false, error: "Could not reach verification service." };
  }
}

/** True when the public site key is configured (controls whether the widget renders). */
export function turnstileConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}
