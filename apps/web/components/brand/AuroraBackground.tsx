"use client";

import { useEffect, useRef, useState } from "react";
import { cn, rgba } from "@/lib/utils";

type Variant = "magenta" | "purple" | "cyan" | "orchid";
type Intensity = "subtle" | "normal" | "strong";

interface AuroraBackgroundProps {
  className?: string;
  variant?: Variant;
  intensity?: Intensity;
  /** Disable the desktop mouse-parallax. Useful for tests and SSR. */
  noParallax?: boolean;
}

const palette: Record<Variant, readonly [string, string, string]> = {
  magenta: ["#FF1F8F", "#B847FF", "#5DD6FF"],
  purple: ["#B847FF", "#2A0E5A", "#5DD6FF"],
  cyan: ["#5DD6FF", "#B847FF", "#FF1F8F"],
  orchid: ["#B847FF", "#E9D5FF", "#FF1F8F"],
};

const alphaFor: Record<Intensity, number> = {
  subtle: 0.25,
  normal: 0.4,
  strong: 0.55,
};

/**
 * Aurora background, four blurred radial blobs drifting independently
 * with optional mouse-position parallax on desktop (RPD §4.5).
 *
 * Parallax shifts each blob by a fraction of the cursor offset from the
 * viewport center. Disabled automatically when:
 *   - prefers-reduced-motion is set
 *   - viewport is narrower than 1024px (mobile/tablet)
 *   - `noParallax` prop is true
 */
export function AuroraBackground({
  className,
  variant = "magenta",
  intensity = "normal",
  noParallax = false,
}: AuroraBackgroundProps) {
  const colors = palette[variant];
  const alpha = alphaFor[intensity];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (noParallax) return;
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(min-width: 1024px)");
    if (motionQuery.matches || !widthQuery.matches) return;

    let raf = 0;
    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const x = (event.clientX - cx) / cx;
        const y = (event.clientY - cy) / cy;
        setParallax({ x, y });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [noParallax]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="aurora-background"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden -z-10",
        className
      )}
    >
      <div className="absolute inset-0 bg-plum" />
      <div
        className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full blur-3xl animate-aurora-drift-1 will-change-transform"
        style={{
          background: `radial-gradient(circle, ${rgba(colors[0], alpha)} 0%, transparent 70%)`,
          transform: `translate3d(${parallax.x * 20}px, ${parallax.y * 20}px, 0)`,
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[55vw] w-[55vw] rounded-full blur-3xl animate-aurora-drift-2 will-change-transform"
        style={{
          background: `radial-gradient(circle, ${rgba(colors[1], alpha * 0.9)} 0%, transparent 70%)`,
          transform: `translate3d(${parallax.x * -25}px, ${parallax.y * -25}px, 0)`,
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/3 h-[50vw] w-[50vw] rounded-full blur-3xl animate-aurora-drift-3 will-change-transform"
        style={{
          background: `radial-gradient(circle, ${rgba(colors[2], alpha * 0.7)} 0%, transparent 70%)`,
          transform: `translate3d(${parallax.x * 15}px, ${parallax.y * -15}px, 0)`,
        }}
      />
      <div
        className="absolute top-1/4 left-1/4 h-[40vw] w-[40vw] rounded-full blur-3xl animate-aurora-drift-4 will-change-transform"
        style={{
          background: `radial-gradient(circle, ${rgba("#2A0E5A", alpha * 0.8)} 0%, transparent 70%)`,
          transform: `translate3d(${parallax.x * -10}px, ${parallax.y * 10}px, 0)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
