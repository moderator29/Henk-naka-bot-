import { CheckCircle2, XCircle } from "lucide-react";
import { getIntegrationStatus, getAdminOverview } from "@/lib/admin/queries";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "System health · Admin" };

export default async function AdminHealthPage() {
  const [integrations, overview] = await Promise.all([
    Promise.resolve(getIntegrationStatus()),
    getAdminOverview(),
  ]);

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">System health</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Integration status (by configured keys, no secrets shown) and live
          platform totals.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {integrations.map((i) => (
          <div key={i.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
            {i.configured ? (
              <CheckCircle2 size={18} className="text-cyan mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle size={18} className="text-lilac/40 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-white text-sm font-medium">{i.name}</p>
              <p className="text-xs text-lilac/50">
                {i.configured ? "Connected" : "Not configured"} · {i.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-display text-sm font-semibold text-white mb-3">Totals</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            ["Users", overview.totalUsers],
            ["Creators", overview.totalCreators],
            ["Posts", overview.totalPosts],
            ["Active subs", overview.activeSubscriptions],
          ].map(([label, value]) => (
            <div key={label as string}>
              <dd className="font-display text-2xl font-bold text-white">{formatNumber(value as number)}</dd>
              <dt className="text-[0.7rem] uppercase tracking-wider text-lilac/50">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
