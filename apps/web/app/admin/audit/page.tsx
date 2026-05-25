import { getAuditLog } from "@/lib/admin/queries";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Admin · Audit log" };

export default async function AdminAuditPage() {
  const entries = await getAuditLog();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Audit log</h1>
      <p className="text-sm text-lilac/60 mb-6">Append-only record of admin actions. Admin access only.</p>
      {entries.length === 0 ? (
        <p className="text-sm text-lilac/55">No admin actions recorded yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {entries.map((e) => (
            <li key={e.id} className="glass rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-mono text-xs text-magenta">{e.action}</span>
              <span className="text-white">{e.actor}</span>
              {e.targetType && (
                <span className="text-lilac/55 text-xs">
                  {e.targetType} {e.targetId ? e.targetId.slice(0, 8) : ""}
                </span>
              )}
              <span className="ml-auto text-xs text-lilac/40">{relativeTime(e.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
