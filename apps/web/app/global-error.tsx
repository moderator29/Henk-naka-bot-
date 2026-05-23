"use client";

import { useEffect } from "react";
import { Sentry } from "@/lib/observability/sentry";

/**
 * Root error boundary. Reports uncaught render errors to Sentry (no-op when
 * the DSN isn't set) and shows a minimal on-brand recovery screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0F0420",
          color: "#E9D5FF",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Something went sideways.
          </h1>
          <p style={{ opacity: 0.7, marginBottom: 24 }}>
            We hit an unexpected error. Try again — if it keeps happening,
            we&apos;re already on it.
          </p>
          <button
            onClick={reset}
            style={{
              background: "linear-gradient(135deg, #FF1F8F, #B847FF)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 24px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
