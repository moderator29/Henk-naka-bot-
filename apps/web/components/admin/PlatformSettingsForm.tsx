"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updatePlatformSetting } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

export function PlatformSettingsForm({
  feeBps,
  maintenance,
  signupsEnabled,
}: {
  feeBps: number;
  maintenance: boolean;
  signupsEnabled: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [fee, setFee] = useState(String(feeBps));
  const [maint, setMaint] = useState(maintenance);
  const [signups, setSignups] = useState(signupsEnabled);
  const [busy, setBusy] = useState<string | null>(null);

  async function save(key: string, value: unknown, label: string) {
    setBusy(key);
    const res = await updatePlatformSetting(key, value);
    setBusy(null);
    if (res.ok) {
      push({ tone: "success", title: `${label} saved` });
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Could not save" });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Row label="Platform fee" hint="Basis points taken on transactions (500 = 5%)">
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ""))}
            className="h-9 w-24 rounded-lg bg-plum/60 border border-white/10 px-3 text-sm text-white focus:border-magenta/50 focus:outline-none"
          />
          <Button size="sm" variant="glass" loading={busy === "platform_fee_bps"}
            onClick={() => save("platform_fee_bps", Number(fee) || 0, "Platform fee")}>
            Save
          </Button>
        </div>
      </Row>

      <Toggle label="Maintenance mode" hint="Show a maintenance notice to non-staff" value={maint} busy={busy === "maintenance_mode"}
        onChange={(v) => { setMaint(v); save("maintenance_mode", v, "Maintenance mode"); }} />

      <Toggle label="Signups enabled" hint="Allow new accounts to register" value={signups} busy={busy === "signups_enabled"}
        onChange={(v) => { setSignups(v); save("signups_enabled", v, "Signups"); }} />
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-xs text-lilac/50">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  busy,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  busy: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label} hint={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={busy}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          value ? "bg-gradient-primary" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            value ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </Row>
  );
}
