"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { setUserVerified, type AdminResult } from "@/lib/admin/actions";
import type { AdminUser } from "@/lib/admin/queries";

export function CreatorsTable({ creators }: { creators: (AdminUser & { verified: boolean })[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(id: string, fn: () => Promise<AdminResult>, ok: string) {
    setBusy(id);
    const res = await fn();
    setBusy(null);
    push(res.ok ? { tone: "success", title: ok } : { tone: "error", title: res.error ?? "Failed" });
    if (res.ok) router.refresh();
  }

  if (creators.length === 0) return <p className="text-sm text-lilac/55">No creators yet.</p>;

  return (
    <div className="flex flex-col gap-2">
      {creators.map((c) => (
        <div key={c.id} className="glass edge-light rounded-xl p-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate flex items-center gap-1">
              {c.displayName ?? c.username ?? "Creator"}
              {c.verified && <BadgeCheck size={13} className="text-cyan" />}
            </p>
            <p className="text-xs text-lilac/50 truncate">{c.username ? `@${c.username}` : c.email}</p>
          </div>
          {c.username && (
            <Link href={`/creators/${c.username}`} className="text-xs text-lilac/60 hover:text-white">View</Link>
          )}
          <Button
            size="sm"
            variant={c.verified ? "glass" : "secondary"}
            loading={busy === c.id}
            onClick={() => run(c.id, () => setUserVerified(c.id, !c.verified), c.verified ? "Verification removed" : "Creator verified")}
          >
            {c.verified ? "Unverify" : "Verify"}
          </Button>
        </div>
      ))}
    </div>
  );
}
