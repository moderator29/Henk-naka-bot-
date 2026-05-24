"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Serializable format presets. Server Components can't pass a function prop to
 * a Client Component (Next throws during RSC serialization), so server callers
 * use `formatPreset` (a plain string) instead of `format`. Client callers may
 * still pass a `format` function directly.
 */
export type StatFormatPreset =
  | "int"
  | "price6"
  | "percentSigned"
  | "usdCompact"
  | "compact";

const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);

const PRESETS: Record<StatFormatPreset, (n: number) => string> = {
  int: (n) => Math.round(n).toLocaleString(),
  price6: (n) => `$${n.toFixed(6)}`,
  percentSigned: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`,
  usdCompact: (n) => `$${compact(n)}`,
  compact,
};

interface StatTickerProps {
  value: number;
  /** Client-only formatter. Do NOT pass from a Server Component. */
  format?: (n: number) => string;
  /** Serializable formatter selector — safe from Server Components. */
  formatPreset?: StatFormatPreset;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Counts from 0 → value when scrolled into view (RPD §7.7).
 * Subsequent value changes animate from the previous to the new target.
 */
export function StatTicker({
  value,
  format,
  formatPreset = "int",
  duration = 1.2,
  className,
  prefix,
  suffix,
}: StatTickerProps) {
  const fmt = format ?? PRESETS[formatPreset];
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => fmt(latest));
  const [display, setDisplay] = useState(fmt(0));

  useEffect(() => {
    const unsub = rounded.on("change", setDisplay);
    return unsub;
  }, [rounded]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, value, duration, mv]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
