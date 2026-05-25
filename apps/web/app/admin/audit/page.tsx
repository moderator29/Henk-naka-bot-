import { listAuditLog } from "@/lib/admin/queries";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Audit log · Admin" };

export default async function AdminAuditPage() {
  const log = await listAuditLog();

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Audit log</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Every sensitive admin action, who did it, and when. Append-only.
        </p>
      </header>

      {log.length === 0 ? (
        <p className="text-sm text-lilac/60 py-8 text-center">No admin actions recorded yet.</p>
      ) : (
        <ul className="rounded-2xl border border-white/10 divide-y divide-white/5">
          {log.map((l) => (
            <li key={l.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white">
                  <span className="font-medium">{l.actorName}</span>{" "}
                  <span className="text-lilac/70">{l.action.replace(/_/g, " ")}</span>
                  {l.targetType && (
                    <span className="text-lilac/45">
                      {" "}· {l.targetType} {l.targetId?.slice(0, 10)}
                    </span>
                  )}
                </p>
                {l.detail && (
                  <p className="text-[0.7rem] text-lilac/40 mt-0.5 font-mono truncate max-w-xl">
                    {JSON.stringify(l.detail)}
                  </p>
                )}
              </div>
              <span className="text-[0.7rem] text-lilac/40 whitespace-nowrap">
                {relativeTime(l.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
