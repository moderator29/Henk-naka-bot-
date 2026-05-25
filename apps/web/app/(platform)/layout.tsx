import { PlatformShell } from "@/components/platform/PlatformShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ConciergeFab } from "@/components/ai/ConciergeFab";
import { WalletProviders } from "@/components/web3/WalletProviders";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getSessionUser();
  let onboardingDone = false;
  if (me && configured()) {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_preferences")
      .select("onboarding_completed")
      .eq("user_id", me.id)
      .maybeSingle<{ onboarding_completed: boolean }>();
    onboardingDone = data?.onboarding_completed === true;
  }

  return (
    <WalletProviders>
      <PlatformShell>
        <OnboardingGate initiallyComplete={onboardingDone} />
        {children}
        <ConciergeFab />
      </PlatformShell>
    </WalletProviders>
  );
}
