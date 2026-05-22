"use client";

import { useEffect, useState } from "react";
import { OnboardingFlow } from "./OnboardingFlow";
import { isOnboardingComplete } from "./OnboardingFlow";

/**
 * Mounts the OnboardingFlow exactly once when a brand-new user enters the
 * platform. Wraps platform pages at the layout level so the flow shows on
 * the first platform paint, not the marketing surface.
 *
 * Server-side persistence in user_preferences.onboarding_completed is added
 * once auth is wired (sub-branch #8). Until then, completion is recorded
 * in localStorage so the flow doesn't reshow on refresh.
 * PENDING_SUPABASE_AUTH.
 */
export function OnboardingGate() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      setShouldShow(true);
    }
  }, []);

  if (!shouldShow) return null;
  return <OnboardingFlow onComplete={() => setShouldShow(false)} onSkip={() => setShouldShow(false)} />;
}
