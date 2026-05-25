import { createAdminClient } from "@/lib/supabase/admin";
import { getMyRole, atLeast } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { formatNumber, relativeTime } from "@/lib/utils";

export const metadata = { title: "Admin · Finance" };

export default async function AdminFinancePage() {
  if (!atLeast(await getMyRole(), "admin")) redirect("/admin");

  let tips: { amount_nsfw: number | string; tx_hash: string | null; created_at: string }[] = [];
  let activeSubs = 0;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const [{ data: t }, subs] = await Promise.all([
      admin.from("tips").select("amount_nsfw, tx_hash, created_at").order("created_at", { ascending: false }).limit(100),
      admin.from("subscriptions").select("id", { count: "exact", head: true }).gt("expires_at", new Date().toISOString()),
    ]);
    tips = (t ?? []) as typeof tips;
    activeSubs = subs.count ?? 0;
  }
  const tipVolume = tips.reduce((s, t) => s + Number(t.amount_nsfw || 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Transactions &amp; finance</h1>
      <p className="text-sm text-lilac/60 mb-6">
        Tips and subscriptions settle on-chain in $NSFW directly to creators. Automated payouts are pending the payout contract.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="glass edge-light rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-lilac/50">Active subscriptions</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">{activeSubs.toLocaleString()}</p>
        </div>
        <div className="glass edge-light rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-lilac/50">Tip volume (recent)</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">{formatNumber(tipVolume)} <span className="text-sm text-lilac/60">$NSFW</span></p>
        </div>
        <div className="glass edge-light rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-lilac/50">Tips (recent)</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">{tips.length}</p>
        </div>
      </div>

      <h2 className="text-xs uppercase tracking-wider text-lilac/50 mb-3">Recent tips</h2>
      {tips.length === 0 ? (
        <p className="text-sm text-lilac/55">No tips yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {tips.slice(0, 50).map((t, i) => (
            <li key={i} className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm">
              <span className="font-display font-semibold text-white">{formatNumber(Number(t.amount_nsfw))} $NSFW</span>
              {t.tx_hash && <span className="font-mono text-xs text-lilac/40">{t.tx_hash.slice(0, 10)}…</span>}
              <span className="ml-auto text-xs text-lilac/40">{relativeTime(t.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
