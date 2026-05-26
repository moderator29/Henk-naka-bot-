import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase session on every request, and gates the in-app
 * platform routes: signed-out visitors are redirected to sign in. When Supabase
 * env isn't configured (local dev before keys land) it passes through.
 */

// In-app surfaces that require authentication. Marketing (/, /token, /journey,
// /docs) and the auth pages stay public.
const PROTECTED_PREFIXES = [
  "/explore",
  "/feed",
  "/pveels",
  "/news",
  "/messages",
  "/marketplace",
  "/staking",
  "/dashboard",
  "/profile",
  "/settings",
  "/compose",
  "/notifications",
  "/creators",
  "/bookmarks",
  "/subscriptions",
  "/become-creator",
  "/admin",
];

function isProtected(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the platform: no session, no entry. Redirect to sign in with a return path.
  if (!user && isProtected(req.nextUrl.pathname)) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(redirect);
  }

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
