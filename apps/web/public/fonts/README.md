# Self-hosted fonts

## Clash Display

The display face per RPD §4.3. Until the variable woff2 is dropped here,
`apps/web/lib/fonts.ts` falls back to **Space Grotesk** via
`next/font/google` (sandbox blocks api.fontshare.com so the asset can't
be fetched automatically).

To install:
1. Download `ClashDisplay-Variable.woff2` from
   https://www.fontshare.com/fonts/clash-display
2. Place it here as `ClashDisplay-Variable.woff2`.
3. In `apps/web/lib/fonts.ts`, swap the `display` export from the
   `Space_Grotesk` block to the commented `localFont(...)` block.

No other code changes required — every component reads
`var(--font-display)`.
