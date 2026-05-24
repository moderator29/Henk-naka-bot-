/**
 * Logo asset manifest.
 *
 * Flip a flag from false to true after the corresponding file lands under
 * apps/web/public/brand/logo/. The Logo component picks it up automatically.
 *
 * PENDING_REAL_LOGO_ASSET, every flag is false until the owner ships the
 * processed lockup. The placeholder mark renders in the meantime.
 */

export type LogoAssetKey =
  | "full"
  | "mark"
  | "full-mono"
  | "mark-mono";

export interface LogoAsset {
  src: string;
  width: number;
  height: number;
}

const HAS_REAL: Record<LogoAssetKey, boolean> = {
  full: true,
  mark: true,
  "full-mono": true,
  "mark-mono": true,
};

// The processed transparent logo (intrinsic 854x666). The Logo component
// scales it by height per usage. A single color asset serves dark and inverted
// surfaces alike until dedicated mono variants are provided.
const FULL: LogoAsset = { src: "/brand/logo/logo-full.png", width: 854, height: 666 };
const MARK: LogoAsset = { src: "/brand/logo/logo-mark.png", width: 854, height: 666 };

export const LOGO_ASSETS: Record<LogoAssetKey, LogoAsset> = {
  full: FULL,
  mark: MARK,
  "full-mono": FULL,
  "mark-mono": MARK,
};

export function hasRealLogoAsset(key: LogoAssetKey): boolean {
  return HAS_REAL[key];
}
