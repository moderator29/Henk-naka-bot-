import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export const metadata = {
  title: "Welcome",
};

/**
 * Standalone onboarding route, used by the Settings "Replay tour" action.
 * Reachable directly at /onboarding.
 */
export default function OnboardingRoutePage() {
  return <OnboardingFlow />;
}
