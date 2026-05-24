# Pleasure Coin logo

The real, processed Pleasure Coin logo files live here. They are loaded by
`apps/web/components/brand/Logo.tsx` via the manifest in
`apps/web/components/brand/logo-manifest.ts`.

## Files

| File | What it is |
| --- | --- |
| `logo-full.png` | Full color logo, transparent background (intrinsic 854x666) |
| `logo-mark.png` | Mark used for compact contexts, favicon, and app icons |

The Logo component scales these by height per usage, so a single high-res
transparent PNG stays crisp across the marketing nav and footer, the platform
shell rail, the auth screens, and onboarding. The favicon and app icons
(`apps/web/app/icon.png`, `apps/web/app/apple-icon.png`) and the PWA manifest
also use this asset.

To refresh the logo, replace these PNGs (keep the filenames). If the aspect
ratio changes, update the `width`/`height` in `logo-manifest.ts`. If a dedicated
white/monochrome version is provided later, add `logo-full-mono.png` /
`logo-mark-mono.png` and point the `*-mono` entries in the manifest at them.
