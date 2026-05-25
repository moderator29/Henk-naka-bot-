"use client";

import { useState } from "react";
import { Section } from "@/components/settings/AccountSettings";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { updateAppearance } from "@/lib/profile/actions";
import { REDUCE_MOTION_COOKIE } from "@/lib/profile/settings";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-gradient-primary" : "bg-white/10"
      )}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/**
 * Appearance settings. Theme is the brand dark by design; the Reduce motion
 * toggle forces calmer motion regardless of the OS setting, applied instantly
 * (a class on <html>) and persisted (+ a cookie the root layout reads so it
 * holds on the next load with no flash).
 */
export function AppearanceSettings({ reduceMotion: initial }: { reduceMotion: boolean }) {
  const { push } = useToast();
  const [reduceMotion, setReduceMotion] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function set(value: boolean) {
    setReduceMotion(value);
    document.documentElement.classList.toggle("reduce-motion", value);
    document.cookie = `${REDUCE_MOTION_COOKIE}=${value ? "1" : "0"}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setSaving(true);
    const res = await updateAppearance({ reduceMotion: value });
    setSaving(false);
    if (!res.ok) {
      setReduceMotion(!value);
      document.documentElement.classList.toggle("reduce-motion", !value);
      push({ tone: "error", title: res.error ?? "Could not save" });
    }
  }

  return (
    <Section title="Appearance" desc={saving ? "Saving…" : "How the app looks and moves."}>
      <div className="flex items-center justify-between gap-4 py-1">
        <div>
          <p className="text-sm font-medium text-white">Reduce motion</p>
          <p className="text-xs text-lilac/55">Calms animations and transitions across the app.</p>
        </div>
        <Switch checked={reduceMotion} onChange={set} label="Reduce motion" />
      </div>
      <div className="flex items-center justify-between gap-4 py-1 border-t border-white/5 pt-3">
        <div>
          <p className="text-sm font-medium text-white">Theme</p>
          <p className="text-xs text-lilac/55">Pleasure Coin uses a single, considered dark theme.</p>
        </div>
        <span className="text-xs text-lilac/45">Dark</span>
      </div>
    </Section>
  );
}
