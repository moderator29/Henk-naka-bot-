"use client";

import { Globe, Users, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Audience / visibility selector, shared by the post composer and the Pveels
 * studio. A row of tappable pills choosing who sees the content. Selecting
 * "Subscribers" or a specific tier marks the content as gated.
 */

export type Audience = "public" | "followers" | "subscribers" | "tier";

export interface TierOption {
  id: string;
  name: string;
}

const OPTIONS: {
  id: Audience;
  label: string;
  hint: string;
  icon: typeof Globe;
}[] = [
  { id: "public", label: "Public", hint: "Anyone on Pleasure Coin", icon: Globe },
  { id: "followers", label: "Free followers", hint: "People who follow you", icon: Users },
  { id: "subscribers", label: "Subscribers", hint: "Your paying subscribers", icon: Lock },
  { id: "tier", label: "Specific tier", hint: "One subscription tier", icon: Star },
];

export function AudienceSelector({
  value,
  onChange,
  tiers,
  tierId,
  onTierChange,
}: {
  value: Audience;
  onChange: (a: Audience) => void;
  tiers: TierOption[];
  tierId: string | null;
  onTierChange: (id: string) => void;
}) {
  const options = tiers.length > 0 ? OPTIONS : OPTIONS.filter((o) => o.id !== "tier");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-lilac/80">Who can see this?</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = value === o.id;
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-magenta/50 bg-magenta/10"
                  : "border-white/10 bg-plum/40 hover:border-white/20"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 place-items-center rounded-lg shrink-0",
                  active ? "bg-gradient-primary text-white" : "glass text-lilac"
                )}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{o.label}</span>
                <span className="block text-xs text-lilac/55">{o.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {value === "tier" && tiers.length > 0 && (
        <select
          value={tierId ?? ""}
          onChange={(e) => onTierChange(e.target.value)}
          className="mt-1 rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-magenta/50 focus:outline-none"
        >
          <option value="" disabled>
            Choose a tier
          </option>
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
