"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { ONBOARDING_CARDS } from "./cards";
import { OnboardingCardView } from "./OnboardingCardView";

/**
 * Full-screen onboarding carousel. 15 cards, swipeable on touch,
 * arrows/clicks on desktop, keyboard arrows everywhere. Skip + replay paths
 * route through `/settings` for replays and call onComplete on finish.
 *
 * Persistence to `user_preferences.onboarding_completed` happens in the
 * server action wired in sub-branch #8 (auth) — until then, persistence
 * stays local (localStorage) so the flow doesn't re-show every visit.
 * Labeled PENDING_SUPABASE_AUTH where the swap goes.
 */

const STORAGE_KEY = "aurora.onboarding.completedAt";
const SWIPE_THRESHOLD = 64;
const SWIPE_VELOCITY = 250;

export interface OnboardingFlowProps {
  /** Where to send the user when they finish or skip */
  exitHref?: string;
  /** Called when the user finishes (last card → Done) */
  onComplete?: () => void | Promise<void>;
  /** Called when the user taps Skip */
  onSkip?: () => void | Promise<void>;
}

export function OnboardingFlow({
  exitHref = "/explore",
  onComplete,
  onSkip,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const dialogRef = useRef<HTMLElement | null>(null);

  // Move focus into the dialog on mount + restore previous focus on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    // Lock body scroll while the dialog owns the viewport.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const total = ONBOARDING_CARDS.length;
  const card = ONBOARDING_CARDS[index]!;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setDirection(clamped > index ? 1 : -1);
      setIndex(clamped);
    },
    [index, total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const persistCompletion = useCallback(() => {
    try {
      // PENDING_SUPABASE_AUTH — once user_preferences is reachable, swap this
      // localStorage write for a server action that updates
      // user_preferences.onboarding_completed.
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Storage may be unavailable in private mode — non-fatal.
    }
  }, []);

  const handleComplete = useCallback(async () => {
    persistCompletion();
    await onComplete?.();
    router.push(exitHref);
  }, [exitHref, onComplete, persistCompletion, router]);

  const handleSkip = useCallback(async () => {
    persistCompletion();
    await onSkip?.();
    router.push(exitHref);
  }, [exitHref, onSkip, persistCompletion, router]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isLast) handleComplete();
        else next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!isFirst) prev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleComplete, handleSkip, isFirst, isLast, next, prev]);

  const onDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) {
      if (isLast) handleComplete();
      else next();
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) {
      if (!isFirst) prev();
    }
  };

  return (
    <section
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-headline"
      tabIndex={-1}
      className="fixed inset-0 z-[60] bg-plum focus:outline-none"
    >
      {/* Skip + counter */}
      {/* Logo + counter + skip */}
      <div className="fixed top-4 inset-x-4 z-[61] flex items-center justify-between gap-4">
        <Logo href={null} size="sm" />
        <span
          aria-live="polite"
          className="text-xs font-mono uppercase tracking-wider text-lilac/50"
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-lilac/80 hover:text-white transition-colors"
        >
          Skip
          <X size={14} />
        </button>
      </div>

      {/* Card stage */}
      <div className="relative h-[100svh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <h1 id="onboarding-headline" className="sr-only">
              {card.headline}
            </h1>
            <OnboardingCardView card={card} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="fixed bottom-0 inset-x-0 z-[61] pb-6 px-6 pointer-events-none">
        <div className="max-w-2xl mx-auto flex items-center gap-4 pointer-events-auto">
          <Button
            variant="glass"
            size="icon"
            aria-label="Previous card"
            onClick={prev}
            disabled={isFirst}
            className="hidden sm:inline-flex"
          >
            <ChevronLeft size={18} />
          </Button>

          <ol
            role="tablist"
            aria-label="Onboarding progress"
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            {ONBOARDING_CARDS.map((c, i) => {
              const isActive = i === index;
              const isPast = i < index;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Card ${i + 1}: ${c.eyebrow}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-300",
                      isActive
                        ? "w-8 bg-gradient-primary shadow-glow"
                        : isPast
                          ? "w-3 bg-magenta/60"
                          : "w-3 bg-lilac/20 hover:bg-lilac/40"
                    )}
                  />
                </li>
              );
            })}
          </ol>

          {isLast ? (
            <Button
              size="md"
              onClick={handleComplete}
              className="min-w-[7rem]"
            >
              Enter
            </Button>
          ) : (
            <Button
              variant="glass"
              size="icon"
              aria-label="Next card"
              onClick={next}
              className="hidden sm:inline-flex"
            >
              <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/** Programmatic check used by the platform layout to decide whether to
 *  auto-show the flow on first visit. PENDING_SUPABASE_AUTH — replace the
 *  localStorage read with a server-side fetch of
 *  user_preferences.onboarding_completed once auth lands. */
export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

/** Used by the Settings replay action to reset and re-open the flow. */
export function resetOnboarding() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
