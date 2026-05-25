import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Composer } from "@/components/feed/Composer";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { TierOption } from "@/components/compose/AudienceSelector";

export const metadata = { title: "Create a post" };

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function ComposePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/compose");

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

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/feed"
          aria-label="Back to feed"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">
          Create a <span className="text-gradient">post</span>
        </h1>
      </header>
      <Composer tiers={tiers} />
    </div>
  );
}
