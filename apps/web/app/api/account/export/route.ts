import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/ratelimit";

/**
 * GDPR-style data export. Returns everything we hold for the signed-in user as
 * a downloadable JSON file. Runs under the caller's session so RLS scopes every
 * query to their own rows; rate-limited because it's a heavier, sensitive read.
 */
export async function GET() {
  let user;
  try {
    user = await getSessionUser();
  } catch {
    user = null;
  }
  if (!user) {
    return NextResponse.json({ error: "Sign in to export your data." }, { status: 401 });
  }

  if (!(await rateLimit("account-export", user.id, 5, "1 h"))) {
    return NextResponse.json({ error: "Too many exports. Try again later." }, { status: 429 });
  }

  const supabase = createClient();
  const id = user.id;

  const [
    profile,
    creatorProfile,
    posts,
    following,
    followers,
    likes,
    saves,
    comments,
    tipsSent,
    tipsReceived,
    subscriptions,
    preferences,
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", id).maybeSingle(),
    supabase.from("creator_profiles").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("posts").select("id, caption, category, audience, created_at").eq("creator_id", id),
    supabase.from("follows").select("following_id, created_at").eq("follower_id", id),
    supabase.from("follows").select("follower_id, created_at").eq("following_id", id),
    supabase.from("likes").select("post_id, created_at").eq("user_id", id),
    supabase.from("saves").select("post_id, created_at").eq("user_id", id),
    supabase.from("comments").select("id, post_id, body, created_at").eq("user_id", id),
    supabase.from("tips").select("to_user, amount_nsfw, tx_hash, created_at").eq("from_user", id),
    supabase.from("tips").select("from_user, amount_nsfw, tx_hash, created_at").eq("to_user", id),
    supabase.from("subscriptions").select("tier_id, started_at, expires_at, auto_renew, tx_hash").eq("fan_id", id),
    supabase.from("user_preferences").select("*").eq("user_id", id).maybeSingle(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { id, email: user.email },
    profile: profile.data ?? null,
    creatorProfile: creatorProfile.data ?? null,
    posts: posts.data ?? [],
    following: following.data ?? [],
    followers: followers.data ?? [],
    likes: likes.data ?? [],
    saves: saves.data ?? [],
    comments: comments.data ?? [],
    tipsSent: tipsSent.data ?? [],
    tipsReceived: tipsReceived.data ?? [],
    subscriptions: subscriptions.data ?? [],
    preferences: preferences.data ?? null,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pleasure-coin-data-${id}.json"`,
    },
  });
}
