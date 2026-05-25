import { redirect } from "next/navigation";
import { PveelComposer } from "@/components/pveels/PveelComposer";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TierOption } from "@/components/compose/AudienceSelector";

export const metadata = { title: "New Pveel" };

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function CreatePveelPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/pveels/create");

  let tiers: TierOption[] = [];
  if (configured()) {
    const supabase = createClient();
    const { data } = await supabase
      .from("subscription_tiers")
      .select("id, name")
      .eq("creator_id", me.id)
      .eq("is_active", true)
      .order("price_nsfw", { ascending: true });
    tiers = ((data ?? []) as { id: string; name: string }[]).map((t) => ({
      id: t.id,
      name: t.name,
    }));
  }

  return <PveelComposer tiers={tiers} />;
}
