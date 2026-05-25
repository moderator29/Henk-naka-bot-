"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { relativeTime } from "@/lib/utils";
import { setReportStatus, removeContent, suspendUser, type AdminResult } from "@/lib/admin/actions";
import type { AdminReport } from "@/lib/admin/queries";

const STATUS_TONE: Record<string, string> = {
  open: "text-magenta",
  reviewing: "text-cyan",
  resolved: "text-green-400",
  dismissed: "text-lilac/50",
};

export function ReportsQueue({ reports }: { reports: AdminReport[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<AdminResult>, ok: string) {
    setBusy(key);
    const res = await fn();
    setBusy(null);
    push(res.ok ? { tone: "success", title: ok } : { tone: "error", title: res.error ?? "Failed" });
    if (res.ok) router.refresh();
  }

  if (reports.length === 0) {
    return <p className="text-sm text-lilac/55">No reports. The queue is clear.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((r) => {
        const removable = r.targetType === "post" || r.targetType === "pveel" || r.targetType === "comment";
        return (
          <li key={r.id} className="glass edge-light rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="uppercase tracking-wider text-lilac/50">{r.targetType}</span>
              <span className={`font-medium ${STATUS_TONE[r.status] ?? "text-lilac/60"}`}>{r.status}</span>
              <span className="text-lilac/40 ml-auto">{relativeTime(r.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-white font-medium">{r.reason}</p>
            {r.details && <p className="mt-1 text-sm text-lilac/70">{r.details}</p>}
            <p className="mt-1 text-xs text-lilac/45">
              Reported by {r.reporter} · target <span className="font-mono">{r.targetId.slice(0, 8)}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="glass" leftIcon={<Check size={14} />} loading={busy === `res-${r.id}`}
                onClick={() => run(`res-${r.id}`, () => setReportStatus(r.id, "resolved"), "Marked resolved")}>
                Resolve
              </Button>
              <Button size="sm" variant="glass" leftIcon={<X size={14} />} loading={busy === `dis-${r.id}`}
                onClick={() => run(`dis-${r.id}`, () => setReportStatus(r.id, "dismissed"), "Dismissed")}>
                Dismiss
              </Button>
              {removable && (
                <Button size="sm" variant="glass" className="text-red-300" leftIcon={<Trash2 size={14} />} loading={busy === `rm-${r.id}`}
                  onClick={() => run(`rm-${r.id}`, () => removeContent(r.targetType as "post" | "pveel" | "comment", r.targetId), "Content removed")}>
                  Remove content
                </Button>
              )}
              {r.targetType === "user" && (
                <Button size="sm" variant="glass" className="text-red-300" leftIcon={<Ban size={14} />} loading={busy === `sus-${r.id}`}
                  onClick={() => run(`sus-${r.id}`, () => suspendUser(r.targetId, true), "User suspended")}>
                  Suspend user
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
