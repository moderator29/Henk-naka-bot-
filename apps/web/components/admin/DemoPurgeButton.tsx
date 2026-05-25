"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { purgeDemoContent } from "@/lib/admin/actions";

export function DemoPurgeButton({ count }: { count: number }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function purge() {
    setBusy(true);
    const res = await purgeDemoContent();
    setBusy(false);
    setConfirm(false);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not purge" });
      return;
    }
    push({ tone: "success", title: "Demo content purged" });
    router.refresh();
  }

  if (count === 0) {
    return <p className="text-sm text-lilac/55">No demo content remaining.</p>;
  }

  return confirm ? (
    <div className="flex items-center gap-2">
      <span className="text-sm text-lilac/70">Remove all {count} demo items?</span>
      <Button size="sm" loading={busy} onClick={purge} className="bg-red-500 hover:bg-red-500 text-white">
        Yes, purge
      </Button>
      <Button size="sm" variant="glass" onClick={() => setConfirm(false)}>Cancel</Button>
    </div>
  ) : (
    <Button variant="glass" className="text-red-300" leftIcon={<Trash2 size={15} />} onClick={() => setConfirm(true)}>
      Purge {count} demo items
    </Button>
  );
}
