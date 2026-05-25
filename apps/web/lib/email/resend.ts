import "server-only";

/**
 * Resend transactional email. Uses the REST API directly (no SDK dependency).
 * Env-gated: with no RESEND_API_KEY the senders are a no-op, so flows never
 * break in environments without email configured. Stays on the test sender
 * until a verified domain is set; swapping is a one-line env change
 * (RESEND_FROM_EMAIL / RESEND_FROM_NAME).
 */

const ENDPOINT = "https://api.resend.com/emails";

function from(): string {
  const name = process.env.RESEND_FROM_NAME ?? "Pleasure Coin";
  const email = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  return `${name} <${email}>`;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return; // PENDING_RESEND_KEY: no-op without a key
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: from(), to, subject, html }),
    });
  } catch {
    // Email is best-effort; never block the originating action.
  }
}

/** Branded shell matching the Supabase auth templates. */
function shell(heading: string, body: string, footnote?: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0F0420;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0420;padding:40px 0;"><tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#16092e;border-radius:20px;padding:40px;border:1px solid rgba(255,31,143,0.2);">
<tr><td align="center" style="padding-bottom:24px;"><span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">PLEASURE COIN</span></td></tr>
<tr><td align="center" style="padding-bottom:8px;"><h1 style="margin:0;font-size:24px;color:#ffffff;">${heading}</h1></td></tr>
<tr><td align="center" style="padding-bottom:8px;"><p style="margin:0;font-size:15px;line-height:22px;color:#E9D5FF;">${body}</p></td></tr>
${footnote ? `<tr><td align="center" style="padding-top:16px;"><p style="margin:0;font-size:12px;color:#7a6b95;">${footnote}</p></td></tr>` : ""}
</table>
<p style="margin-top:24px;font-size:11px;color:#5a4d75;">Pleasure Coin &middot; Powered by $NSFW</p>
</td></tr></table></body></html>`;
}

export function sendWelcomeEmail(to: string) {
  return send(
    to,
    "Welcome to Pleasure Coin",
    shell(
      "You're in.",
      "Your account is confirmed. Jump into your feed, discover creators, and make it yours.",
      "If this wasn't you, you can safely ignore this email."
    )
  );
}

export function sendPasswordChangedEmail(to: string) {
  return send(
    to,
    "Your Pleasure Coin password was changed",
    shell(
      "Password changed",
      "Your password was just updated. If this was you, you're all set.",
      "If you did not change your password, reset it immediately and contact support."
    )
  );
}

export function sendAccountDeletionEmail(to: string) {
  return send(
    to,
    "Your Pleasure Coin account was deleted",
    shell(
      "Account deleted",
      "Your account and data have been permanently removed. We're sorry to see you go.",
      "If you did not request this, contact support right away."
    )
  );
}
