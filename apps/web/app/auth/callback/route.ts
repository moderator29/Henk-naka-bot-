import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Only allow same-origin, single-slash-rooted destinations. Rejects "//host"
 * and "/\host" protocol-relative forms so a crafted `next` cannot redirect a
 * freshly authenticated user off-site.
 */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/")) return "/feed";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/feed";
  return value;
}

/**
 * OAuth + email-confirmation callback. Supabase redirects here with a `code`
 * that we exchange for a session. On success we send the user to Discover.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Supabase env not configured; fall through to the error redirect.
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
