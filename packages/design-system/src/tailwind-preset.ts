import type { Config } from "tailwindcss";
import { colors, shadows } from "./tokens";

/**
 * Tailwind preset consumed by apps/web/tailwind.config.ts.
 * Keeps the design tokens authoritative — no app-level color overrides.
 */
export const auroraPreset = {
  theme: {
    extend: {
      colors: {
        plum: { DEFAULT: colors.plum, 50: "#1A0833", 900: "#0A0218" },
        "plum-2": colors.plumRaised,
        imperial: {
          DEFAULT: colors.imperial,
          light: "#3D1580",
          dark: "#1F0A45",
        },
        magenta: {
          DEFAULT: colors.magenta,
          light: "#FF4FA8",
          dark: "#CC1872",
        },
        orchid: {
          DEFAULT: colors.orchid,
          light: "#C870FF",
          dark: "#9A38D9",
        },
        lilac: { DEFAULT: colors.lilac, dark: "#C9B0E8" },
        cyan: { DEFAULT: colors.cyan, dark: "#3AB5E0" },
        muted: colors.muted,
        faint: colors.faint,
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #FF1F8F 0%, #B847FF 100%)",
        "gradient-hero":
          "linear-gradient(90deg, #FF1F8F 0%, #B847FF 50%, #5DD6FF 100%)",
      },
      boxShadow: {
        e1: shadows.e1,
        e2: shadows.e2,
        e3: shadows.e3,
        e4: shadows.e4,
        "glow-magenta": shadows.glowMagenta,
        glow: shadows.glow,
        "glow-lg": shadows.glowLg,
        "glow-orchid": shadows.glowOrchid,
        "glow-cyan": shadows.glowCyan,
        glass: shadows.glass,
      },
      borderRadius: {
        pill: "999px",
      },
      backdropBlur: {
        glass: "20px",
        shell: "16px",
      },
      animation: {
        "aurora-drift-1": "aurora-drift-1 40s ease-in-out infinite",
        "aurora-drift-2": "aurora-drift-2 55s ease-in-out infinite",
        "aurora-drift-3": "aurora-drift-3 35s ease-in-out infinite",
        "aurora-drift-4": "aurora-drift-4 60s ease-in-out infinite",
        "float-3d": "float-3d 8s ease-in-out infinite",
        "float-particle": "float-particle 16s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "marquee": "marquee 40s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "aurora-drift-1": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(20%, 15%) scale(1.1)" },
        },
        "aurora-drift-2": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(-15%, 20%) scale(1.15)" },
        },
        "aurora-drift-3": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1.1)" },
          "50%": { transform: "translate(10%, -20%) scale(1)" },
        },
        "aurora-drift-4": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(-20%, -10%) scale(1.2)" },
        },
        "float-3d": {
          "0%, 100%": { transform: "rotateY(-5deg) translateY(0px)" },
          "50%": { transform: "rotateY(5deg) translateY(-6px)" },
        },
        "float-particle": {
          "0%, 100%": { transform: "translateY(0px)", opacity: "0.3" },
          "50%": { transform: "translateY(-24px)", opacity: "0.8" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 24px rgba(255,31,143,0.35)" },
          "50%": { boxShadow: "0 0 36px rgba(255,31,143,0.55)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
} satisfies Partial<Config>;
