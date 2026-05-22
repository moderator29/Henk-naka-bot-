import { PlatformShell } from "@/components/platform/PlatformShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformShell>
      <OnboardingGate />
      {children}
    </PlatformShell>
  );
}
