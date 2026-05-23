import * as Sentry from "@sentry/nextjs";

/**
 * Sentry init — gated on NEXT_PUBLIC_SENTRY_DSN. When the DSN isn't set
 * (local dev before keys land) init is a no-op, so nothing crashes and no
 * events are sent. Shared by server, edge, and client entry points.
 */

let initialized = false;

export function initSentry(runtime: "server" | "edge" | "client") {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || initialized) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Conservative sampling; tune once real traffic exists.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Session replay only matters client-side.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: runtime === "client" ? 0.5 : 0,
    enabled: true,
  });
  initialized = true;
}

export { Sentry };
