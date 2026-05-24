<img width="854" height="666" alt="Subject" src="https://github.com/user-attachments/assets/20026304-8f13-4327-9010-e9dcee4f099f" />
<img width="854" height="666" alt="IMG_0285" src="https://github.com/user-attachments/assets/0d53a85a-382f-4196-8934-e9c586a2565e" />
# Pleasure Coin logo

The real, processed Pleasure Coin logo files belong here. They are loaded
by `apps/web/components/brand/Logo.tsx` via the manifest in
`apps/web/components/brand/logo-manifest.ts`.

## Files expected

| File                    | What it is                                  |
|-------------------------|---------------------------------------------|
| `logo-full.svg`         | Full lockup (mark + wordmark), color        |
| `logo-mark.svg`         | Mark only (icon), color                     |
| `logo-full-mono.svg`    | Full lockup, white/monochrome for inverted surfaces |
| `logo-mark-mono.svg`    | Mark only, white/monochrome                 |

PNG fallbacks at 2x and 3x density may live alongside the SVGs
(`logo-full.png`, `logo-full@2x.png`, etc.) if vectorization is impractical.

## Processing the source file

The owner's source has a white background that must be removed for placement
on dark surfaces. Workflow:

1. Open the source in a tool that supports color-key removal (Photopea,
   Figma, Photoshop, GIMP, or `remove.bg`).
2. Delete the white background, refine the edges so there is no halo or
   fringe.
3. Export an SVG version if the mark is geometric enough to vectorize
   cleanly. Otherwise export a PNG at 3x of the intended display size.
4. Drop the files in this directory using the names above.
5. Open `apps/web/components/brand/logo-manifest.ts` and flip the matching
   flag from `false` to `true`.

The Logo component starts using the real asset on its next mount.
PENDING_REAL_LOGO_ASSET label stays on the manifest until every file lands.

## Where the logo renders today

Anywhere `<Logo />` is mounted picks up the asset automatically:

- Marketing nav (top of every public page)
- Marketing footer
- Platform sidebar (desktop)
- Platform top bar (mobile, mark-only)
- Login / Signup screens (when built)
- Onboarding card flow (when built)
- Loading screens (when built)

Favicon, OG share image, and PWA icon ship as separate files under
`apps/web/public/` (`favicon.ico`, `og-image.png`, `apple-touch-icon.png`,
`icon-192.png`, `icon-512.png`) and are generated from the same source.
