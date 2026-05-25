import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DashboardView, type DashboardData } from "@/components/creator/DashboardView";

export const metadata = { title: "Creator Dashboard" };

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface TierRow {
  id: string;
  name: string;
  price_nsfw: string;
  is_active: boolean;
  subscriber_count?: number;
}

export default async function DashboardPage() {
  const me = await getSessionUser();

  let data: DashboardData = {
    displayName: me?.email?.split("@")[0] ?? "You",
    isCreator: false,
    totalEarnings: 0,
    subscriberCount: 0,
    postCount: 0,
    tips30d: 0,
    baselineMonthly: 0,
    tiers: [],
  };

  if (me && configured()) {
    const supabase = createClient();
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

    const [userRow, profile, tiers, postCount, tips] = await Promise.all([
      supabase.from("users").select("display_name, is_creator").eq("id", me.id).maybeSingle<{ display_name: string | null; is_creator: boolean | null }>(),
      supabase.from("creator_profiles").select("total_earnings_nsfw, subscriber_count").eq("user_id", me.id).maybeSingle<{ total_earnings_nsfw: string; subscriber_count: number }>(),
      supabase.from("subscription_tiers").select("id, name, price_nsfw, is_active").eq("creator_id", me.id),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("creator_id", me.id),
      supabase.from("tips").select("amount_nsfw").eq("to_user", me.id).gte("created_at", since),
    ]);

    const tierRows = (tiers.data as TierRow[] | null) ?? [];
    const activeTiers = tierRows.filter((t) => t.is_active);
    const avgTierPrice =
      activeTiers.length > 0
        ? activeTiers.reduce((s, t) => s + Number(t.price_nsfw), 0) / activeTiers.length
        : 0;
    const subscriberCount = profile.data?.subscriber_count ?? 0;
    const tips30d = (tips.data ?? []).reduce((s, t) => s + Number((t as { amount_nsfw: string }).amount_nsfw), 0);

    data = {
      displayName: userRow.data?.display_name ?? data.displayName,
      isCreator: userRow.data?.is_creator ?? false,
      totalEarnings: Number(profile.data?.total_earnings_nsfw ?? 0),
      subscriberCount,
      postCount: postCount.count ?? 0,
      tips30d,
      baselineMonthly: subscriberCount * avgTierPrice + tips30d,
      tiers: tierRows.map((t) => ({
        id: t.id,
        name: t.name,
        price: Number(t.price_nsfw),
        active: t.is_active,
      })),
    };
  }

  return <DashboardView data={data} />;
}
