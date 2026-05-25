"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { reviewCreatorApplication } from "@/lib/admin/actions";
import type { AdminApplicationRow } from "@/lib/admin/queries";
import { cn, relativeTime } from "@/lib/utils";

export function ApplicationQueue({
  initial,
  status,
  statuses,
}: {
  initial: AdminApplicationRow[];
  status: string;
  statuses: string[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function review(id: string, approve: boolean) {
    setBusyId(id);
    const res = await reviewCreatorApplication(id, approve, notes[id]?.trim() || undefined);
    setBusyId(null);
    if (res.ok) {
      push({ tone: "success", title: approve ? "Creator approved" : "Application rejected" });
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
            href={`/admin/creators?status=${s}`}
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
          No {status} applications.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {initial.map((a) => (
            <li key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium">
                    {a.displayName ?? a.applicantName}
                  </p>
                  <p className="text-[0.7rem] text-lilac/45">
                    applied {relativeTime(a.createdAt)}
                  </p>
                </div>
              </div>
              {a.bio && <p className="text-sm text-lilac/75 mt-2">{a.bio}</p>}
              {a.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.categories.map((c) => (
                    <span key={c} className="text-[0.7rem] px-2 py-0.5 rounded-full bg-white/5 text-lilac/70">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {a.payoutWallet && (
                <p className="text-[0.7rem] text-lilac/45 mt-2 font-mono truncate">
                  payout: {a.payoutWallet}
                </p>
              )}

              {status === "pending" && (
                <div className="mt-3 flex flex-col gap-2">
                  <input
                    value={notes[a.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [a.id]: e.target.value }))}
                    placeholder="Optional note (sent to the applicant)"
                    className="h-9 rounded-lg bg-plum/60 border border-white/10 px-3 text-xs text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" loading={busyId === a.id} onClick={() => review(a.id, true)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="glass" loading={busyId === a.id} onClick={() => review(a.id, false)}>
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
