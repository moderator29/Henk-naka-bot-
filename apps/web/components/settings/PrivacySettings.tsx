"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { setDmPermission } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";

type DmPermission = "everyone" | "mutuals";

/**
 * Privacy controls. Following is always open; this governs who can start a DM
 * with you. Persists immediately via setDmPermission.
 */
export function PrivacySettings({ dmPermission }: { dmPermission: DmPermission }) {
  const { push } = useToast();
  const [value, setValue] = useState<DmPermission>(dmPermission);
  const [busy, setBusy] = useState(false);

  async function choose(next: DmPermission) {
    if (next === value) return;
    const prev = value;
    setValue(next);
    setBusy(true);
    const res = await setDmPermission(next);
    setBusy(false);
    if (res.ok) {
      push({ tone: "success", title: "Privacy updated" });
    } else {
      setValue(prev);
      push({ tone: "error", title: res.error ?? "Could not save" });
    }
  }

  const options: { value: DmPermission; label: string; hint: string }[] = [
    { value: "everyone", label: "Everyone", hint: "Anyone can message you" },
    { value: "mutuals", label: "People you follow", hint: "Only mutuals can start a chat" },
  ];

  return (
    <Card className="edge-light flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">Privacy</h2>
        <p className="mt-1 text-sm text-lilac/60">
          Anyone can follow you. Choose who can send you direct messages.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Who can message you</legend>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={busy}
            onClick={() => choose(o.value)}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
              value === o.value
                ? "border-magenta/50 bg-magenta/10"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <span>
              <span className="block text-sm font-medium text-white">{o.label}</span>
              <span className="block text-xs text-lilac/55">{o.hint}</span>
            </span>
            <span
              className={cn(
                "h-4 w-4 rounded-full border-2 flex-shrink-0",
                value === o.value ? "border-magenta bg-magenta" : "border-white/30"
              )}
            />
          </button>
        ))}
      </fieldset>
    </Card>
  );
}
