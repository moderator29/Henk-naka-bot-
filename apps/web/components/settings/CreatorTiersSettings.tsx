"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X } from "lucide-react";
import { Section } from "@/components/settings/AccountSettings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatNumber } from "@/lib/utils";
import {
  createTier,
  updateTier,
  setTierActive,
  type CreatorTierRow,
} from "@/lib/subscriptions/actions";

/**
 * Creator subscription tiers: create, edit, and activate/deactivate tiers
 * priced in $NSFW with a benefits list. Creating the first tier marks the
 * account as a creator. Fans subscribe to these from the creator's profile.
 */
export function CreatorTiersSettings({ tiers }: { tiers: CreatorTierRow[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleActive(t: CreatorTierRow) {
    const res = await setTierActive(t.id, !t.isActive);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not update" });
      return;
    }
    router.refresh();
  }

  async function submit(values: { name: string; priceNsfw: number; benefits: string[] }, id: string | "new") {
    setBusy(true);
    const res = id === "new" ? await createTier(values) : await updateTier(id, values);
    setBusy(false);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not save tier" });
      return;
    }
    push({ tone: "success", title: id === "new" ? "Tier created" : "Tier saved" });
    setEditing(null);
    router.refresh();
  }

  return (
    <Section
      title="Creator tiers"
      desc="Set up subscription tiers fans can buy in $NSFW. Adding one makes you a creator."
    >
      <div className="flex flex-col gap-3">
        {tiers.map((t) =>
          editing === t.id ? (
            <TierForm key={t.id} initial={t} busy={busy} onCancel={() => setEditing(null)} onSubmit={(v) => submit(v, t.id)} />
          ) : (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-plum/40 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  {t.name}{" "}
                  <span className="text-lilac/55 font-normal">· {formatNumber(t.priceNsfw)} $NSFW/mo</span>
                  {!t.isActive && <span className="ml-2 text-[0.65rem] uppercase tracking-wider text-lilac/40">inactive</span>}
                </p>
                <p className="text-xs text-lilac/55 truncate">{t.benefits.join(" · ") || "No benefits listed"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="glass" size="sm" leftIcon={<Pencil size={13} />} onClick={() => setEditing(t.id)}>
                  Edit
                </Button>
                <Button variant="glass" size="sm" onClick={() => toggleActive(t)}>
                  {t.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          )
        )}

        {editing === "new" ? (
          <TierForm busy={busy} onCancel={() => setEditing(null)} onSubmit={(v) => submit(v, "new")} />
        ) : (
          <Button variant="glass" leftIcon={<Plus size={15} />} onClick={() => setEditing("new")} className="self-start">
            New tier
          </Button>
        )}
      </div>
    </Section>
  );
}

function TierForm({
  initial,
  busy,
  onCancel,
  onSubmit,
}: {
  initial?: CreatorTierRow;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (v: { name: string; priceNsfw: number; benefits: string[] }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.priceNsfw) : "");
  const [benefits, setBenefits] = useState((initial?.benefits ?? []).join("\n"));

  function save() {
    const list = benefits
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    onSubmit({ name: name.trim(), priceNsfw: Number(price) || 0, benefits: list });
  }

  return (
    <div className="rounded-xl border border-magenta/30 bg-magenta/[0.04] p-4 flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Tier name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Supporter" />
        <Input label="Price ($NSFW / mo)" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="250" inputMode="decimal" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-lilac/80">Benefits (one per line)</label>
        <textarea
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          rows={4}
          placeholder={"All subscribers-only posts\nDirect messages\nEarly access"}
          className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="glass" size="sm" leftIcon={<X size={14} />} onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" loading={busy} leftIcon={<Check size={14} />} onClick={save}>
          Save tier
        </Button>
      </div>
    </div>
  );
}
