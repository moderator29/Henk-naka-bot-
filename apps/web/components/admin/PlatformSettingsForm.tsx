"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { setPlatformSetting } from "@/lib/admin/actions";

export function PlatformSettingsForm({
  maintenance,
  feeBps,
}: {
  maintenance: { enabled: boolean; message: string };
  feeBps: number;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [enabled, setEnabled] = useState(maintenance.enabled);
  const [message, setMessage] = useState(maintenance.message);
  const [fee, setFee] = useState(String(feeBps));
  const [busy, setBusy] = useState<string | null>(null);

  async function save(key: string, value: Record<string, unknown>, label: string) {
    setBusy(key);
    const res = await setPlatformSetting(key, value);
    setBusy(null);
    push(res.ok ? { tone: "success", title: label } : { tone: "error", title: res.error ?? "Failed" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="glass edge-light rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white mb-1">Maintenance mode</h2>
        <p className="text-sm text-lilac/60 mb-3">Shows a banner across the app when on.</p>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-magenta" : "bg-white/15"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
        <div className="mt-3">
          <Input label="Banner message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="We're doing some maintenance, back shortly." />
        </div>
        <div className="mt-3 flex justify-end">
          <Button loading={busy === "maintenance"} onClick={() => save("maintenance", { enabled, message }, "Maintenance updated")}>
            Save
          </Button>
        </div>
      </section>

      <section className="glass edge-light rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white mb-1">Platform fee</h2>
        <p className="text-sm text-lilac/60 mb-3">Basis points taken on transactions (100 bps = 1%).</p>
        <Input label="Fee (bps)" value={fee} onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" />
        <div className="mt-3 flex justify-end">
          <Button loading={busy === "fee"} onClick={() => save("fee", { bps: Number(fee) || 0 }, "Fee updated")}>
            Save
          </Button>
        </div>
      </section>
    </div>
  );
}
