import { ImageResponse } from "next/og";

/**
 * Dynamic favicon — renders the diamond mark gradient at 32x32 via Next's
 * built-in OG image runtime. Picked up automatically as /favicon.
 *
 * When the real logo lands, swap this to load the SVG via fs.readFile
 * (or replace with a static apps/web/public/favicon.ico).
 *
 * PENDING_REAL_LOGO_ASSET — placeholder uses the same diamond mark the
 * <Logo /> component falls back to.
 */
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#FF1F8F" />
              <stop offset="60%" stopColor="#B847FF" />
              <stop offset="100%" stopColor="#5DD6FF" />
            </linearGradient>
          </defs>
          <path
            d="M16 2 L28 12 L16 30 L4 12 Z"
            fill="url(#grad)"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
