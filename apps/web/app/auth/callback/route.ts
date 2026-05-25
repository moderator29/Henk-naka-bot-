import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth + email-confirmation callback. Supabase redirects here with a `code`
 * that we exchange for a session. On success we send the user to Discover.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

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
