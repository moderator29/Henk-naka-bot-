/**
 * Aurora design tokens — single source of truth.
 *
 * Colors, gradients, typography, motion. Imported by the Tailwind preset and
 * consumed directly by TS code. CSS-variable equivalents live in tokens.css.
 */

export const colors = {
  plum: "#0F0420",
  imperial: "#2A0E5A",
  magenta: "#FF1F8F",
  orchid: "#B847FF",
  lilac: "#E9D5FF",
  cyan: "#5DD6FF",
  white: "#FFFFFF",
} as const;

export type ColorToken = keyof typeof colors;

export const gradients = {
  primary: "linear-gradient(135deg, #FF1F8F 0%, #B847FF 100%)",
  hero: "linear-gradient(90deg, #FF1F8F 0%, #B847FF 50%, #5DD6FF 100%)",
  aurora:
    "radial-gradient(ellipse at top left, rgba(255,31,143,0.3), transparent 50%), radial-gradient(ellipse at bottom right, rgba(184,71,255,0.3), transparent 50%), radial-gradient(ellipse at center, rgba(93,214,255,0.15), transparent 60%)",
} as const;

/**
 * Section-specific aurora tuning per RPD §4.5.
 */
export const sectionAccent = {
  token: { primary: colors.magenta, secondary: colors.cyan },
  staking: { primary: colors.orchid, secondary: colors.cyan },
  nft: { primary: colors.magenta, secondary: colors.orchid },
  creators: { primary: colors.orchid, secondary: colors.lilac },
} as const;

export type SectionKey = keyof typeof sectionAccent;

/**
 * Motion curves and durations per RPD §7. Imported by Framer Motion
 * components and CSS transition strings.
 */
export const motion = {
  durations: {
    instant: 0.1,
    fast: 0.15,
    base: 0.25,
    moderate: 0.4,
    slow: 0.6,
    auroraDrift: 40,
  },
  easings: {
    smooth: [0.25, 0.1, 0.25, 1] as const,
    spring: [0.16, 1, 0.3, 1] as const,
    sharp: [0.4, 0, 0.2, 1] as const,
  },
  stagger: {
    cards: 0.05,
    words: 0.05,
  },
} as const;

export const typography = {
  fontFamilies: {
    display: ["Clash Display", "system-ui", "sans-serif"],
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "ui-monospace", "monospace"],
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  full: "9999px",
} as const;

export const shadows = {
  glow: "0 0 24px rgba(255,31,143,0.35)",
  glowLg: "0 0 48px rgba(255,31,143,0.45)",
  glowOrchid: "0 0 24px rgba(184,71,255,0.4)",
  glowCyan: "0 0 24px rgba(93,214,255,0.4)",
  glass:
    "0 8px 32px rgba(15,4,32,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
} as const;
