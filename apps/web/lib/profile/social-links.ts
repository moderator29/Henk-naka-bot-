/**
 * Normalize a Telegram or X (Twitter) handle/URL into a canonical https URL.
 * Accepts a bare handle, an @handle, or a full profile URL, and validates the
 * handle against each platform's rules. Empty input clears the link (url:null,
 * no error). Invalid input returns an error message for the form to surface.
 */

export interface SocialResult {
  url: string | null;
  error?: string;
}

const TELEGRAM_HANDLE = /^[A-Za-z0-9_]{5,32}$/;
const X_HANDLE = /^[A-Za-z0-9_]{1,15}$/;

function extractHandle(input: string, hostPattern: RegExp): string {
  const m = input.match(hostPattern);
  const raw = m ? m[1]! : input;
  return raw.replace(/^@/, "");
}

export function normalizeTelegram(input: string): SocialResult {
  const v = input.trim();
  if (!v) return { url: null };
  const handle = extractHandle(
    v,
    /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/(@?[A-Za-z0-9_]+)\/?$/i
  );
  if (!TELEGRAM_HANDLE.test(handle)) {
    return { url: null, error: "Enter a valid Telegram handle or t.me link" };
  }
  return { url: `https://t.me/${handle}` };
}

export function normalizeX(input: string): SocialResult {
  const v = input.trim();
  if (!v) return { url: null };
  const handle = extractHandle(
    v,
    /^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/(@?[A-Za-z0-9_]+)\/?$/i
  );
  if (!X_HANDLE.test(handle)) {
    return { url: null, error: "Enter a valid X handle or x.com link" };
  }
  return { url: `https://x.com/${handle}` };
}
