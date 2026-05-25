"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  createTier,
  updateTier,
  setTierActive,
  type TierInput,
} from "@/lib/creators/tier-actions";
import { cn } from "@/lib/utils";

export interface ManagedTier {
  id: string;
  name: string;
  priceUsd: number | null;
  priceNsfw: number;
  benefits: string[];
  active: boolean;
}

export function TierManager({ tiers }: { tiers: ManagedTier[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleActive(t: ManagedTier) {
    setPendingId(t.id);
    const res = await setTierActive(t.id, !t.active);
    setPendingId(null);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not update tier" });
      return;
    }
    push({ tone: "success", title: t.active ? "Tier hidden" : "Tier visible" });
    router.refresh();
  }

  return (
    <Card className="edge-light">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Subscription tiers
        </h2>
        {!creating && (
          <Button size="sm" variant="glass" onClick={() => setCreating(true)}>
            <Plus size={15} /> New tier
          </Button>
        )}
      </div>

      {creating && (
        <TierForm
          onCancel={() => setCreating(false)}
          onSubmit={async (input) => {
            const res = await createTier(input);
            if (res.ok) {
              push({ tone: "success", title: "Tier created" });
              setCreating(false);
              router.refresh();
            } else {
              push({ tone: "error", title: res.error ?? "Could not create tier" });
            }
            return res.ok;
          }}
        />
      )}

      {tiers.length === 0 && !creating ? (
        <p className="text-sm text-lilac/60">
          You have no tiers yet. Create one to let fans subscribe and to gate
          subscriber-only posts.
        </p>
      ) : (
        <div className="flex flex-col gap-3 mt-3">
          {tiers.map((t) =>
            editingId === t.id ? (
              <TierForm
                key={t.id}
                initial={t}
                onCancel={() => setEditingId(null)}
                onSubmit={async (input) => {
                  const res = await updateTier(t.id, input);
                  if (res.ok) {
                    push({ tone: "success", title: "Tier updated" });
                    setEditingId(null);
                    router.refresh();
                  } else {
                    push({ tone: "error", title: res.error ?? "Could not update tier" });
                  }
                  return res.ok;
                }}
              />
            ) : (
              <div
                key={t.id}
                className={cn(
                  "rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3",
                  !t.active && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{t.name}</p>
                    <p className="text-xs text-lilac/50">
                      {t.priceUsd != null
                        ? `$${t.priceUsd.toFixed(2)} / mo`
                        : `${Math.round(t.priceNsfw)} $NSFW / mo`}
                      {" · "}
                      {t.active ? "Visible" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      aria-label="Edit tier"
                      onClick={() => setEditingId(t.id)}
                      className="h-8 w-8 grid place-items-center rounded-lg text-lilac/60 hover:text-white hover:bg-white/5"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={t.active ? "Hide tier" : "Show tier"}
                      disabled={pendingId === t.id}
                      onClick={() => toggleActive(t)}
                      className="h-8 w-8 grid place-items-center rounded-lg text-lilac/60 hover:text-white hover:bg-white/5"
                    >
                      {t.active ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {t.benefits.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {t.benefits.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-lilac/70"
                      >
                        <Check size={13} className="text-cyan flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}

function TierForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ManagedTier;
  onSubmit: (input: TierInput) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(
    initial?.priceUsd != null ? String(initial.priceUsd) : ""
  );
  const [benefits, setBenefits] = useState((initial?.benefits ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const priceUsd = Number(price);
    if (!name.trim()) return setError("Give the tier a name.");
    if (!(priceUsd > 0)) return setError("Set a monthly price in USD.");
    const list = benefits
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    setSaving(true);
    const ok = await onSubmit({ name: name.trim(), priceUsd, benefits: list });
    setSaving(false);
    if (!ok) setError("Could not save. Try again.");
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-magenta/20 p-4 flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tier name (e.g. VIP)"
        className="h-10 rounded-lg bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
      />
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-lilac/50">
          $
        </span>
        <input
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="20.00"
          aria-label="Monthly price in USD"
          className="h-10 w-full rounded-lg bg-plum/60 border border-white/10 pl-7 pr-16 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-lilac/50">
          / month
        </span>
      </div>
      <textarea
        value={benefits}
        onChange={(e) => setBenefits(e.target.value)}
        rows={3}
        placeholder="One benefit per line"
        className="resize-none rounded-lg bg-plum/60 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <Button size="sm" loading={saving} onClick={submit}>
          {initial ? "Save changes" : "Create tier"}
        </Button>
        <Button size="sm" variant="glass" onClick={onCancel}>
          <X size={14} /> Cancel
        </Button>
      </div>
    </div>
  );
}
