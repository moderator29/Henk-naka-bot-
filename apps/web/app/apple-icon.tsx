import { ImageResponse } from "next/og";

/**
 * Apple touch icon — 180x180 rounded magenta-orchid-cyan diamond on plum.
 * PENDING_REAL_LOGO_ASSET — swap when the processed logo lands.
 */
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 30%, #2A0E5A 0%, #0F0420 60%)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
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
