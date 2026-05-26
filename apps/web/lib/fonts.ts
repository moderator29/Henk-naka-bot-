/**
 * Font wiring for the app.
 *
 * Inter for everything: body copy at regular weights and headings at the
 * heavier weights. Inter is the de-facto standard for modern product UIs
 * (Linear, GitHub, Vercel-class apps), so the platform reads clean and
 * professional rather than stylized. JetBrains Mono for addresses and code.
 */

import { Inter, JetBrains_Mono } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Headings use Inter at its heavier weights via --font-display.
export const display = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});
