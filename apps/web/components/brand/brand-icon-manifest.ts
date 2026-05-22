/**
 * Manifest of which BrandIcon names have a real PNG render committed under
 * /public/brand/icons/.
 *
 * Until Tim & Paul (or Spline/Blender) deliver the renders, all entries stay
 * false and BrandIcon renders the Lucide-glyph placeholder.
 *
 * To wire a real render:
 *   1. Drop {name}.png at 3x (e.g. 192×192 for the 64px size used in cards)
 *      under apps/web/public/brand/icons/
 *   2. Flip the corresponding flag below from false to true.
 *   3. next/image serves 2x to standard displays and 3x to retina, sized
 *      automatically.
 */

import type { BrandIconName } from "./BrandIcon";

// PLACEHOLDER_PENDING_3D_ASSETS — flip a flag to true once the asset lands.
const RENDERS: Record<BrandIconName, boolean> = {
  rocket: false,
  heart: false,
  diamond: false,
  lock: false,
  globe: false,
  sparkle: false,
  crown: false,
};

export function brandIconHasRender(name: BrandIconName): boolean {
  return RENDERS[name];
}
