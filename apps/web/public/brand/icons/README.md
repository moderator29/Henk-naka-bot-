# Brand icon renders

Drop 3D icon PNG renders here per RPD §4.4.

## Expected files

Naming convention: `{name}.png` (next/image serves 2x/3x automatically).

| name | role |
| --- | --- |
| rocket.png  | $NSFW token |
| heart.png   | Creators surface |
| diamond.png | NFT / PleasureNifty |
| lock.png    | Staking |
| globe.png   | Pleasureland / metaverse |
| sparkle.png | AI surfaces |
| crown.png   | Premium tiers |

Recommended source dimension: 192×192 (renders crisp through 3x retina).

## Wiring

After dropping the PNG in, open
`apps/web/components/brand/brand-icon-manifest.ts` and flip the matching
flag from `false` to `true`. The `<BrandIcon />` component picks up the
real render on its next mount; no other code changes required.

PLACEHOLDER_PENDING_3D_ASSETS — until each render lands, the Lucide-glyph
placeholder is used.
