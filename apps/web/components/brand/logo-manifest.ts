/**
 * Logo asset manifest.
 *
 * Flip a flag from false to true after the corresponding file lands under
 * apps/web/public/brand/logo/. The Logo component picks it up automatically.
 *
 * PENDING_REAL_LOGO_ASSET — every flag is false until the owner ships the
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
  full: false,
  mark: false,
  "full-mono": false,
  "mark-mono": false,
};

export const LOGO_ASSETS: Record<LogoAssetKey, LogoAsset> = {
  full: { src: "/brand/logo/logo-full.svg", width: 192, height: 48 },
  mark: { src: "/brand/logo/logo-mark.svg", width: 48, height: 48 },
  "full-mono": {
    src: "/brand/logo/logo-full-mono.svg",
    width: 192,
    height: 48,
  },
  "mark-mono": {
    src: "/brand/logo/logo-mark-mono.svg",
    width: 48,
    height: 48,
  },
};

export function hasRealLogoAsset(key: LogoAssetKey): boolean {
  return HAS_REAL[key];
}
