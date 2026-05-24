"use client";

import { cn, rgba } from "@/lib/utils";

type Variant = "magenta" | "purple" | "cyan" | "orchid";
type Intensity = "app" | "subtle" | "normal" | "hero" | "strong";

interface AuroraBackgroundProps {
  className?: string;
  variant?: Variant;
  /**
   * Ambient strength. The aurora is an accent, never the event:
   * `app` (in-app, content stays the star) through `hero` (marketing hero,
   * slightly stronger but still subtle). Legacy values map onto the same scale.
   */
  intensity?: Intensity;
  /** Retained for API compatibility; parallax was removed for calm. */
  noParallax?: boolean;
}

const palette: Record<Variant, readonly [string, string, string]> = {
  magenta: ["#FF1F8F", "#B847FF", "#5DD6FF"],
  purple: ["#B847FF", "#2A0E5A", "#5DD6FF"],
  cyan: ["#5DD6FF", "#B847FF", "#FF1F8F"],
  orchid: ["#B847FF", "#E9D5FF", "#FF1F8F"],
};

// Peak blob alpha. In-app stays in the 0.06 to 0.10 band so content leads;
// the hero is allowed a touch more. Nothing here is loud.
const alphaFor: Record<Intensity, number> = {
  app: 0.08,
  subtle: 0.08,
  normal: 0.11,
  hero: 0.16,
  strong: 0.16,
};

/**
 * Aurora background. Three to four large, heavily blurred radial blobs over
 * plum, each drifting on its own very slow translate-only path so they never
 * sync (Part 5 motion doctrine). This is the only continuous motion in the
 * product and it must read as a living gradient, not an animation. A faint
 * grain sits on top. prefers-reduced-motion freezes it (handled globally).
 */
export function AuroraBackground({
  className,
  variant = "magenta",
  intensity = "app",
}: AuroraBackgroundProps) {
  const colors = palette[variant];
  const alpha = alphaFor[intensity];

  const blob = (
    color: string,
    a: number,
    cls: string,
    extra: React.CSSProperties
  ) => (
    <div
      className={cn(
        "absolute rounded-full will-change-transform motion-reduce:animate-none",
        cls
      )}
      style={{
        background: `radial-gradient(circle, ${rgba(color, a)} 0%, transparent 70%)`,
        filter: "blur(100px)",
        ...extra,
      }}
    />
  );

  return (
    <div
      aria-hidden="true"
      data-testid="aurora-background"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden -z-10",
        className
      )}
    >
      <div className="absolute inset-0 bg-plum" />
      {blob(colors[0], alpha, "animate-aurora-drift-1 h-[55vw] w-[55vw]", {
        top: "-12%",
        left: "-10%",
      })}
      {blob(colors[1], alpha * 0.9, "animate-aurora-drift-2 h-[50vw] w-[50vw]", {
        top: "20%",
        right: "-12%",
      })}
      {blob(colors[2], alpha * 0.6, "animate-aurora-drift-3 h-[45vw] w-[45vw]", {
        bottom: "-15%",
        left: "25%",
      })}
      {blob("#2A0E5A", alpha * 0.8, "animate-aurora-drift-4 h-[40vw] w-[40vw]", {
        top: "18%",
        left: "18%",
      })}

      {/* faint grain */}
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
