/**
 * Aurora design tokens — single source of truth.
 *
 * Colors, gradients, typography, motion. Imported by the Tailwind preset and
 * consumed directly by TS code. CSS-variable equivalents live in tokens.css.
 */

export const colors = {
  plum: "#0F0420", // base
  plumRaised: "#16092E", // raised surfaces (plum-2)
  imperial: "#2A0E5A", // deep accent
  magenta: "#FF1F8F", // primary
  orchid: "#B847FF", // primary 2
  lilac: "#E9D5FF", // soft body text
  cyan: "#5DD6FF", // rare accent, never a fill
  muted: "#7A6B95", // secondary text
  faint: "#5A4D75", // captions
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
    fast: 0.14, // 140ms — hover, press, toggle, tooltip
    base: 0.24, // 240ms — most UI
    page: 0.32, // 320ms — route transitions
    slow: 0.42, // 420ms — section reveals, modals
    moderate: 0.4,
    auroraDrift: 40, // 24s to 40s, very slow ambient
  },
  easings: {
    // Part 5 doctrine: ease-out-soft is the default for reveals and most UI.
    outSoft: [0.22, 1, 0.36, 1] as const,
    inOutSoft: [0.65, 0, 0.35, 1] as const,
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
  sm: "0.625rem", // 10px
  md: "1rem", // 16px
  lg: "1.25rem", // 20px — default card
  xl: "1.75rem", // 28px — featured card / content panel
  "2xl": "2rem",
  pill: "999px",
  full: "9999px",
} as const;

/**
 * Elevation scale per Part 5. e1 to e4 are soft, layered, never harsh. Glow is
 * reserved for hover on primary actions and one or two hero elements only.
 */
export const shadows = {
  e1: "0 1px 2px rgba(0,0,0,0.30)",
  e2: "0 2px 8px rgba(0,0,0,0.35)",
  e3: "0 8px 24px rgba(0,0,0,0.40)",
  e4: "0 16px 48px rgba(0,0,0,0.45)",
  glowMagenta: "0 0 40px rgba(255,31,143,0.25)",
  glowOrchid: "0 0 40px rgba(184,71,255,0.22)",
  // Retained aliases used by existing components.
  glow: "0 0 24px rgba(255,31,143,0.35)",
  glowLg: "0 0 48px rgba(255,31,143,0.45)",
  glowCyan: "0 0 24px rgba(93,214,255,0.4)",
  glass:
    "0 8px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)",
} as const;

/**
 * The single glass recipe. Every glass surface (cards, modals, sheets, the
 * shell chrome) reads from this so the product feels like one material.
 */
export const glass = {
  background: "rgba(22,9,46,0.55)",
  border: "rgba(255,255,255,0.08)",
  borderFeatured: "rgba(255,31,143,0.20)",
  highlight: "inset 0 1px 0 rgba(255,255,255,0.06)",
  blur: "20px", // cards / modals
  shellBlur: "16px", // persistent shell chrome (cheaper, not stacked)
} as const;
