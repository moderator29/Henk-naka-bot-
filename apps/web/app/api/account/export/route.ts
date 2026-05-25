import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { signGatedUrl } from "@/lib/media/sign";
import { checkLimit } from "@/lib/ai/ratelimit";

/**
 * GDPR data export (right to access / portability). Returns a JSON file with
 * every row of personal data the signed-in user holds, plus a media manifest
 * of resolvable download links (public URLs pass through; private files get a
 * short-lived signed URL). All reads run under the caller's session so RLS
 * guarantees a user can only ever export their own data. Rate-limited.
 */

type MediaItem = { src?: string; thumb?: string; poster?: string; type?: string };

/** Turn a stored value into a resolvable URL: http(s) passes through; a bare
 * storage path is signed from the private gated-media bucket. */
async function resolve(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  return signGatedUrl(value);
}

export async function GET() {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) {
    return NextResponse.json({ error: "Sign in to export your data." }, { status: 401 });
  }

  const limit = await checkLimit("dataExport", me.id);
  if (!limit.success) {
    return NextResponse.json(
      { error: "You've reached the export limit for today. Try again tomorrow." },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const rows = async (
    builder: PromiseLike<{ data: unknown }>
  ): Promise<unknown> => (await builder).data ?? [];

  const [
    profile,
    preferences,
    creatorProfile,
    tiers,
    posts,
    pveels,
    comments,
    likes,
    saves,
    following,
    followers,
    blocks,
    subscriptions,
    tipsSent,
    tipsReceived,
    notifications,
    staking,
    nftHoldings,
    conversations,
    messagesSent,
  ] = await Promise.all([
    rows(supabase.from("users").select("*").eq("id", me.id)),
    rows(supabase.from("user_preferences").select("*").eq("user_id", me.id)),
    rows(supabase.from("creator_profiles").select("*").eq("user_id", me.id)),
    rows(supabase.from("subscription_tiers").select("*").eq("creator_id", me.id)),
    rows(supabase.from("posts").select("*").eq("creator_id", me.id)),
    rows(supabase.from("pveels").select("*").eq("creator_id", me.id)),
    rows(supabase.from("comments").select("*").eq("user_id", me.id)),
    rows(supabase.from("likes").select("*").eq("user_id", me.id)),
    rows(supabase.from("saves").select("*").eq("user_id", me.id)),
    rows(supabase.from("follows").select("*").eq("follower_id", me.id)),
    rows(supabase.from("follows").select("*").eq("following_id", me.id)),
    rows(supabase.from("blocks").select("*").eq("blocker_id", me.id)),
    rows(supabase.from("subscriptions").select("*").eq("fan_id", me.id)),
    rows(supabase.from("tips").select("*").eq("from_user", me.id)),
    rows(supabase.from("tips").select("*").eq("to_user", me.id)),
    rows(supabase.from("notifications").select("*").eq("user_id", me.id)),
    rows(supabase.from("staking_positions").select("*").eq("user_id", me.id)),
    rows(supabase.from("nft_holdings").select("*").eq("user_id", me.id)),
    rows(
      supabase
        .from("conversations")
        .select("*")
        .or(`participant_a.eq.${me.id},participant_b.eq.${me.id}`)
    ),
    rows(supabase.from("messages").select("*").eq("sender_id", me.id)),
  ]);

  // Resolvable media manifest: avatar/cover + post media + pveel video/poster.
  const profileRow = (profile as { avatar_url?: string; cover_url?: string }[])[0];
  const mediaLinks: string[] = [];
  for (const v of [profileRow?.avatar_url, profileRow?.cover_url]) {
    const u = await resolve(v);
    if (u) mediaLinks.push(u);
  }
  for (const p of posts as { media?: MediaItem[] | null }[]) {
    for (const m of p.media ?? []) {
      for (const u of await Promise.all([resolve(m.src), resolve(m.thumb), resolve(m.poster)])) {
        if (u) mediaLinks.push(u);
      }
    }
  }
  for (const p of pveels as { video_url?: string; poster_url?: string }[]) {
    for (const u of await Promise.all([resolve(p.video_url), resolve(p.poster_url)])) {
      if (u) mediaLinks.push(u);
    }
  }

  const payload = {
    notice:
      "This export contains the personal data associated with your Pleasure Coin account. Media links are time-limited download URLs.",
    exported_at: new Date().toISOString(),
    account: { id: me.id, email: me.email },
    data: {
      profile,
      preferences,
      creator_profile: creatorProfile,
      creator_tiers: tiers,
      posts,
      pveels,
      comments,
      likes,
      saves,
      following,
      followers,
      blocked: blocks,
      subscriptions,
      tips_sent: tipsSent,
      tips_received: tipsReceived,
      notifications,
      staking_positions: staking,
      nft_holdings: nftHoldings,
      conversations,
      messages_sent: messagesSent,
    },
    media_manifest: mediaLinks,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pleasure-coin-data-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
