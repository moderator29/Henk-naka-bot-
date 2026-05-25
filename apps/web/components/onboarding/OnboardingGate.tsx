"use client";

import { useEffect, useState } from "react";
import { OnboardingFlow, isOnboardingComplete } from "./OnboardingFlow";
import { completeOnboarding } from "@/lib/onboarding/actions";

/**
 * Mounts the OnboardingFlow once for a new user on the first platform paint.
 * Completion is the source of truth in user_preferences.onboarding_completed
 * (passed in from the server layout); localStorage is a client-side cache so
 * the flow never re-shows mid-session.
 */
export function OnboardingGate({
  initiallyComplete = false,
}: {
  initiallyComplete?: boolean;
}) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!initiallyComplete && !isOnboardingComplete()) {
      setShouldShow(true);
    }
  }, [initiallyComplete]);

  const finish = () => {
    setShouldShow(false);
    void completeOnboarding();
  };

  if (!shouldShow) return null;
  return <OnboardingFlow onComplete={finish} onSkip={finish} />;
}
