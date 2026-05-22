import { ImageResponse } from "next/og";

/**
 * Default Open Graph share image. 1200x630.
 * PENDING_REAL_LOGO_ASSET — when the processed logo is in /public/brand/logo,
 * load it via fs.readFile and composite on the aurora background. The
 * placeholder below renders the brand wordmark + diamond mark on plum.
 */
export const runtime = "edge";
export const alt = "Pleasure Coin — the unified creator platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          background:
            "radial-gradient(ellipse at top left, rgba(255,31,143,0.35), transparent 50%), radial-gradient(ellipse at bottom right, rgba(184,71,255,0.35), transparent 50%), #0F0420",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <svg width="96" height="96" viewBox="0 0 32 32">
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
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            PleasureCoin
          </span>
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -1.5,
            textAlign: "center",
            lineHeight: 1.05,
            margin: 0,
            maxWidth: 1000,
          }}
        >
          The unified creator platform.
        </h1>
        <p
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#E9D5FF",
            textAlign: "center",
          }}
        >
          AI-native · Polygon-powered · Aurora-styled
        </p>
      </div>
    ),
    { ...size }
  );
}
