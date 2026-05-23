"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { initSentry } from "@/lib/observability/sentry";

/**
 * Client-side observability. Initializes PostHog (gated on key) and Sentry's
 * client runtime (gated on DSN), and records SPA pageviews on route change.
 *
 * Both are no-ops without their env keys — nothing crashes, nothing is sent,
 * no surveillance by default (autocapture off, manual pageviews only).
 */

let posthogReady = false;

function initPostHog() {
  if (posthogReady) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // we send manual pageviews below
    autocapture: false,
    persistence: "localStorage+cookie",
  });
  posthogReady = true;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initSentry("client");
    initPostHog();
  }, []);

  useEffect(() => {
    if (!posthogReady) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/** Thin wrapper so feature code can track without importing posthog directly. */
export function track(event: string, props?: Record<string, unknown>) {
  if (!posthogReady) return;
  posthog.capture(event, props);
}
