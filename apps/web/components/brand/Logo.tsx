import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LOGO_ASSETS,
  hasRealLogoAsset,
  type LogoAssetKey,
} from "./logo-manifest";

interface LogoProps {
  className?: string;
  href?: string | null;
  /**
   * "full" renders the wordmark lockup; "mark" renders just the icon.
   * "auto" picks "full" when showWordmark is true, "mark" otherwise.
   */
  variant?: "auto" | "full" | "mark";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  /** Use the white/monochrome version (for very dark surfaces / inversions) */
  monochrome?: boolean;
}

const sizes = {
  sm: { mark: 24, text: "text-base" },
  md: { mark: 32, text: "text-lg" },
  lg: { mark: 48, text: "text-2xl" },
} as const;

/**
 * Pleasure Coin logo.
 *
 * Resolution order:
 *   1. If a processed asset for the requested variant exists in
 *      apps/web/public/brand/logo/ per logo-manifest.ts, render via
 *      next/image.
 *   2. Otherwise render a labeled placeholder mark (faceted diamond
 *      gradient) so layouts remain pixel-correct.
 *
 * PENDING_REAL_LOGO_ASSET, drop the processed files into
 * apps/web/public/brand/logo/ and flip the matching flags in
 * logo-manifest.ts. No other code changes required.
 */
export function Logo({
  className,
  href = "/",
  variant = "auto",
  showWordmark = true,
  size = "md",
  monochrome = false,
}: LogoProps) {
  const { mark, text } = sizes[size];
  const resolvedVariant: "full" | "mark" =
    variant === "auto" ? (showWordmark ? "full" : "mark") : variant;

  const assetKey: LogoAssetKey = monochrome
    ? (`${resolvedVariant}-mono` as const)
    : resolvedVariant;
  const asset = LOGO_ASSETS[assetKey];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {hasRealLogoAsset(assetKey) && asset ? (
        <Image
          src={asset.src}
          alt="Pleasure Coin"
          width={asset.width}
          height={asset.height}
          priority
          className="w-auto select-none"
          style={{ height: mark }}
        />
      ) : (
        <>
          <PlaceholderMark size={mark} />
          {resolvedVariant === "full" && (
            <span
              className={cn(
                "font-display font-bold tracking-tight leading-[1.25] whitespace-nowrap",
                text
              )}
            >
              Pleasure{" "}
              <span className="text-gradient inline-block pb-[0.08em]">
                Coin
              </span>
            </span>
          )}
        </>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Pleasure Coin home">
        {content}
      </Link>
    );
  }
  return content;
}

function PlaceholderMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="diamond-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#FF1F8F" />
          <stop offset="60%" stopColor="#B847FF" />
          <stop offset="100%" stopColor="#5DD6FF" />
        </linearGradient>
        <filter id="diamond-glow">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <path
        d="M16 2 L28 12 L16 30 L4 12 Z"
        fill="url(#diamond-grad)"
        filter="url(#diamond-glow)"
        opacity="0.5"
      />
      <path d="M16 2 L28 12 L16 30 L4 12 Z" fill="url(#diamond-grad)" />
      <path
        d="M16 2 L28 12 L16 30 L4 12 Z M4 12 L28 12 M16 2 L16 30"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
