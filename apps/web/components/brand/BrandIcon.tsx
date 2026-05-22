"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Heart,
  Diamond,
  Lock,
  Globe,
  Sparkles,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BrandIcon — the 3D-styled icon system per RPD §4.4.
 *
 * MVP renders a glass-extruded card with a Lucide glyph at its center and a
 * tinted glow matching the section accent. The constant Y-axis rotation and
 * float satisfy the §7.4 motion spec.
 *
 * Upgrade path: when Tim & Paul (or Spline) deliver actual 3D renders, swap
 * the body of this component to render PNG renders from /public/brand/icons/
 * at 2x and 3x density, or upgrade further to react-three-fiber.
 *
 * Until then: PLACEHOLDER_PENDING_3D_ASSETS. The visual approximates the
 * extruded-glass aesthetic so layouts and motion are correct now.
 */

export type BrandIconName =
  | "rocket"
  | "heart"
  | "diamond"
  | "lock"
  | "globe"
  | "sparkle"
  | "crown";

const glyphs: Record<BrandIconName, LucideIcon> = {
  rocket: Rocket,
  heart: Heart,
  diamond: Diamond,
  lock: Lock,
  globe: Globe,
  sparkle: Sparkles,
  crown: Crown,
};

const accent: Record<BrandIconName, string> = {
  rocket: "#FF1F8F",
  heart: "#FF4FA8",
  diamond: "#B847FF",
  lock: "#5DD6FF",
  globe: "#5DD6FF",
  sparkle: "#E9D5FF",
  crown: "#FF1F8F",
};

interface BrandIconProps {
  name: BrandIconName;
  size?: number;
  className?: string;
  /** Disable the floating animation entirely */
  motionless?: boolean;
}

export function BrandIcon({
  name,
  size = 64,
  className,
  motionless = false,
}: BrandIconProps) {
  const Glyph = glyphs[name];
  const tint = accent[name];

  return (
    <motion.div
      role="img"
      aria-label={`${name} icon`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl",
        className
      )}
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        border: `1px solid ${tint}33`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px ${tint}40, 0 0 20px ${tint}33`,
        backdropFilter: "blur(12px)",
        transformStyle: "preserve-3d",
        perspective: "600px",
      }}
      animate={
        motionless
          ? undefined
          : { rotateY: [-5, 5, -5], y: [0, -4, 0] }
      }
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{
        scale: 1.05,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 32px ${tint}66, 0 0 30px ${tint}55`,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <Glyph
        size={size * 0.5}
        color={tint}
        strokeWidth={1.75}
        style={{ filter: `drop-shadow(0 2px 4px ${tint}80)` }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 30%)",
        }}
      />
    </motion.div>
  );
}
