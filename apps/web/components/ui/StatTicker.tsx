"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface StatTickerProps {
  value: number;
  /** Pre-formatter applied to the running count */
  format?: (n: number) => string;
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
  format = (n) => Math.round(n).toLocaleString(),
  duration = 1.2,
  className,
  prefix,
  suffix,
}: StatTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (latest) => format(latest));
  const [display, setDisplay] = useState(format(0));

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
