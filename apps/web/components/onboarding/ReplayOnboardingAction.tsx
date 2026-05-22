"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resetOnboarding } from "./OnboardingFlow";

export function ReplayOnboardingAction() {
  const router = useRouter();
  return (
    <Button
      variant="glass"
      leftIcon={<Sparkles size={16} />}
      onClick={() => {
        resetOnboarding();
        router.push("/onboarding");
      }}
    >
      Replay tour
    </Button>
  );
}
