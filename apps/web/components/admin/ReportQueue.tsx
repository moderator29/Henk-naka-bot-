"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { resolveReport, setPostModeration } from "@/lib/admin/actions";
import type { AdminReportRow } from "@/lib/admin/queries";
import { cn, relativeTime } from "@/lib/utils";

export function ReportQueue({
  initial,
  status,
  statuses,
}: {
  initial: AdminReportRow[];
  status: string;
  statuses: string[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(
    id: string,
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okTitle: string
  ) {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    if (res.ok) {
      push({ tone: "success", title: okTitle });
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Action failed" });
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/reports?status=${s}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
              s === status
                ? "bg-gradient-primary text-white"
                : "bg-white/[0.04] text-lilac/65 hover:text-white"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      {initial.length === 0 ? (
        <p className="text-sm text-lilac/60 py-8 text-center">
          Nothing here. The {status} queue is clear.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {initial.map((r) => (
            <li key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white">
                    <span className="capitalize font-medium">{r.targetType}</span>
                    {" reported for "}
                    <span className="text-magenta-light">{r.reason}</span>
                  </p>
                  {r.detail && (
                    <p className="text-xs text-lilac/65 mt-1">{r.detail}</p>
                  )}
                  <p className="text-[0.7rem] text-lilac/40 mt-1.5">
                    by {r.reporterName} · {relativeTime(r.createdAt)} · target {r.targetId.slice(0, 12)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {r.targetType === "post" && (
                  <Button size="sm" variant="glass" loading={busyId === r.id}
                    onClick={() => act(r.id, () => setPostModeration(r.targetId, "removed"), "Post removed")}>
                    Remove post
                  </Button>
                )}
                {r.targetType === "post" && (
                  <Button size="sm" variant="glass" loading={busyId === r.id}
                    onClick={() => act(r.id, () => setPostModeration(r.targetId, "age_restricted"), "Post age-restricted")}>
                    Age-restrict
                  </Button>
                )}
                {status !== "resolved" && (
                  <Button size="sm" loading={busyId === r.id}
                    onClick={() => act(r.id, () => resolveReport(r.id, "resolved"), "Marked resolved")}>
                    Resolve
                  </Button>
                )}
                {status !== "dismissed" && (
                  <Button size="sm" variant="glass" loading={busyId === r.id}
                    onClick={() => act(r.id, () => resolveReport(r.id, "dismissed"), "Dismissed")}>
                    Dismiss
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
