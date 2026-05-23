import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase session on every request so Server Components always
 * see a fresh auth state. When Supabase env isn't configured (local dev before
 * keys land), it passes through untouched rather than crashing.
 *
 * Route gating (redirecting signed-out users away from /feed, /messages, etc.)
 * is layered on here once auth is connected end-to-end.
 */
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const res = NextResponse.next({ request: { headers: req.headers } });

  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name) {
        return req.cookies.get(name)?.value;
      },
      set(name, value, options) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Touch the session to trigger a refresh if the access token is stale.
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, image optimization,
     * favicon, and the runtime-generated brand assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|manifest.webmanifest).*)",
  ],
};
