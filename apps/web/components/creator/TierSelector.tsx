"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatNumber } from "@/lib/utils";
import { SubscribeSheet } from "@/components/subscriptions/SubscribeSheet";
import type { CreatorTier } from "@/lib/creators/types";

/**
 * Visual tier cards with one-tap subscribe. Opens the SubscribeSheet, which
 * runs the real on-chain $NSFW payment and records the subscription. Preview
 * (demo) creators show a clear preview state in the sheet.
 */
export function TierSelector({
  tiers,
  creatorName,
  isPreview = false,
}: {
  tiers: CreatorTier[];
  creatorName: string;
  isPreview?: boolean;
}) {
  const [active, setActive] = useState<CreatorTier | null>(null);

  if (tiers.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-lilac/60">
        This creator hasn&apos;t published subscription tiers yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={cn(
            "relative rounded-2xl p-6 flex flex-col",
            tier.highlighted
              ? "glass-strong border border-magenta/40 shadow-glow"
              : "glass"
          )}
        >
          {tier.highlighted && (
            <span className="absolute -top-2.5 left-6 text-[0.6rem] uppercase tracking-wider bg-gradient-primary text-white px-2.5 py-1 rounded-full">
              Most popular
            </span>
          )}
          <h3 className="font-display text-xl font-semibold text-white">
            {tier.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-gradient">
              {formatNumber(tier.priceNsfw)}
            </span>
            <span className="text-sm text-lilac/60">$NSFW / mo</span>
          </div>
          <ul className="mt-4 space-y-2 flex-1">
            {tier.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-lilac/80">
                <Check size={16} className="text-cyan flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
          <Button
            className="mt-6 w-full"
            variant={tier.highlighted ? "primary" : "glass"}
            onClick={() => setActive(tier)}
          >
            Subscribe
          </Button>
        </div>
      ))}

      {active && (
        <SubscribeSheet
          tier={active}
          creatorName={creatorName}
          isPreview={isPreview}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
