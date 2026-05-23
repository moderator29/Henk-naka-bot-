import { initSentry } from "@/lib/observability/sentry";

/**
 * Next.js instrumentation hook. Runs once per server/edge runtime on boot.
 * Sentry init is gated on the DSN env, so this is a no-op until keys land.
 */
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    initSentry("server");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    initSentry("edge");
  }
}
