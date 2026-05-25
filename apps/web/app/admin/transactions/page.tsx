import { listTransactions } from "@/lib/admin/queries";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Transactions · Admin" };

export default async function AdminTransactionsPage() {
  const rows = await listTransactions(150);

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Transactions</h1>
        <p className="text-sm text-lilac/60 mt-1">
          On-chain tips and subscriptions, newest first. Amounts settle on
          Polygon; the tx hash links the on-chain record.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-lilac/60 py-8 text-center">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-[0.7rem] uppercase tracking-wider text-lilac/50">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Detail</th>
                <th className="px-4 py-3 font-medium">Tx</th>
                <th className="px-4 py-3 font-medium text-right">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={`${t.kind}-${t.id}`} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <span className="text-[0.7rem] font-medium px-2 py-0.5 rounded-full bg-white/5 text-lilac/80 capitalize">
                      {t.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {t.amount} <span className="text-lilac/50">{t.party}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-lilac/45">
                    {t.txHash ? `${t.txHash.slice(0, 10)}…` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-lilac/45 whitespace-nowrap">
                    {relativeTime(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
