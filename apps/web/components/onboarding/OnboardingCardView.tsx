"use client";

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { GradientText } from "@/components/brand/GradientText";
import { cn } from "@/lib/utils";
import type { OnboardingCard } from "./cards";

interface OnboardingCardViewProps {
  card: OnboardingCard;
}

/**
 * A single onboarding card. Same component for large and small; the size
 * variant tunes typography, icon size, and vertical rhythm.
 *
 * The aurora background sits behind every card and shifts variant per card
 * for a slow, cinematic mood drift across the flow.
 */
export function OnboardingCardView({ card }: OnboardingCardViewProps) {
  const large = card.size === "large";

  return (
    <article
      data-testid={`onboarding-card-${card.id}`}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-6"
    >
      <AuroraBackground
        variant={card.auroraVariant}
        intensity={large ? "normal" : "subtle"}
      />

      <div
        className={cn(
          "relative w-full max-w-2xl text-center flex flex-col items-center",
          large ? "gap-8" : "gap-6"
        )}
      >
        <motion.div
          key={`icon-${card.id}`}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <BrandIcon name={card.icon} size={large ? 132 : 96} />
        </motion.div>

        <motion.div
          key={`eyebrow-${card.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xs font-medium uppercase tracking-[0.2em] text-cyan"
        >
          {card.eyebrow}
        </motion.div>

        <motion.h2
          key={`head-${card.id}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "font-display font-bold leading-[1.05] tracking-tight text-white",
            large
              ? "text-4xl sm:text-5xl lg:text-6xl"
              : "text-2xl sm:text-3xl"
          )}
        >
          {renderHeadlineWithAccent(card.headline)}
        </motion.h2>

        <motion.p
          key={`body-${card.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className={cn(
            "text-lilac/80 max-w-xl",
            large ? "text-lg sm:text-xl" : "text-base"
          )}
        >
          {card.body}
        </motion.p>
      </div>
    </article>
  );
}

/**
 * Picks out a key word from the headline to receive the gradient sweep , 
 * keeps the visual rhythm interesting across 15 cards without per-card
 * authoring effort. Falls back to the final word.
 */
function renderHeadlineWithAccent(headline: string) {
  const words = headline.trim().split(/\s+/);
  if (words.length === 0) return headline;
  // Highlight the last "meaningful" word, strip trailing punctuation.
  const lastIdx = words.length - 1;
  const last = words[lastIdx]!;
  const head = words.slice(0, lastIdx).join(" ");
  return (
    <>
      {head ? `${head} ` : ""}
      <GradientText>{last}</GradientText>
    </>
  );
}
