import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * GDPR data export. Returns a JSON file with every row of personal data the
 * signed-in user holds across the platform. All reads run under the caller's
 * session, so RLS guarantees a user can only ever export their own data.
 */
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

  const supabase = createClient();
  const rows = async (
    builder: PromiseLike<{ data: unknown }>
  ): Promise<unknown> => (await builder).data ?? [];

  const [
    profile,
    preferences,
    creatorProfile,
    posts,
    comments,
    likes,
    saves,
    following,
    followers,
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
    rows(supabase.from("posts").select("*").eq("creator_id", me.id)),
    rows(supabase.from("comments").select("*").eq("user_id", me.id)),
    rows(supabase.from("likes").select("*").eq("user_id", me.id)),
    rows(supabase.from("saves").select("*").eq("user_id", me.id)),
    rows(supabase.from("follows").select("*").eq("follower_id", me.id)),
    rows(supabase.from("follows").select("*").eq("following_id", me.id)),
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

  const payload = {
    notice:
      "This export contains the personal data associated with your Pleasure Coin account.",
    exported_at: new Date().toISOString(),
    account: { id: me.id, email: me.email },
    data: {
      profile,
      preferences,
      creator_profile: creatorProfile,
      posts,
      comments,
      likes,
      saves,
      following,
      followers,
      subscriptions,
      tips_sent: tipsSent,
      tips_received: tipsReceived,
      notifications,
      staking_positions: staking,
      nft_holdings: nftHoldings,
      conversations,
      messages_sent: messagesSent,
    },
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
