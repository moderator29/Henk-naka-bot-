"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { purgeDemoNow } from "@/lib/admin/actions";
import type { DemoCounts } from "@/lib/admin/queries";

export function DemoControl({ counts }: { counts: DemoCounts }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  const total = counts.users + counts.posts;

  async function purge() {
    setBusy(true);
    const res = await purgeDemoNow();
    setBusy(false);
    if (res.ok) {
      push({ tone: "success", title: "Demo content purged" });
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Purge failed" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Demo users", counts.users],
          ["Demo posts", counts.posts],
          ["Listings", counts.listings],
        ].map(([label, n]) => (
          <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="font-display text-2xl font-bold text-white">{n as number}</div>
            <div className="text-[0.7rem] uppercase tracking-wider text-lilac/50">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-white text-sm font-medium">Purge all demo content</p>
          <p className="text-xs text-lilac/50">
            {counts.purgedAt
              ? `Last purged ${new Date(counts.purgedAt).toLocaleString()}.`
              : "Never purged."}
            {total === 0 ? " Nothing to purge." : ""}
          </p>
        </div>
        <Button variant="glass" loading={busy} onClick={purge}>
          Purge now
        </Button>
      </div>
    </div>
  );
}
