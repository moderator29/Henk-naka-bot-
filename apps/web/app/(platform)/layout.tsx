import { PlatformShell } from "@/components/platform/PlatformShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ConciergeFab } from "@/components/ai/ConciergeFab";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformShell>
      <OnboardingGate />
      {children}
      <ConciergeFab />
    </PlatformShell>
  );
}
