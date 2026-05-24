/**
 * Font wiring for the app.
 *
 * RPD §4.3 calls for Clash Display (Fontshare) as the display face. The
 * sandbox build environment can't reach Fontshare's CDN, so we ship Space
 * Grotesk via next/font/google as a near-equivalent geometric display face
 * until the owner drops a self-hosted Clash Display woff2 into
 * apps/web/public/fonts/ClashDisplay-Variable.woff2.
 *
 * SWAP PATH, when the Clash file is provided:
 *   1. Place ClashDisplay-Variable.woff2 in apps/web/public/fonts/
 *   2. Replace the spaceGrotesk export with the localFont() block below
 *   3. No other code changes required, every component reads var(--font-display).
 */

import { Inter, JetBrains_Mono, Sora } from "next/font/google";
// import localFont from "next/font/local"; // re-enable when Clash file lands

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

// Display face: Sora — a clean, modern, geometric face that reads premium and
// a touch futuristic. Inter stays for body copy (readability).
export const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Swap target once Clash Display is committed under public/fonts/:
//
// export const display = localFont({
//   src: "../public/fonts/ClashDisplay-Variable.woff2",
//   variable: "--font-display",
//   display: "swap",
//   weight: "200 700",
// });
