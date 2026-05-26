import { PlatformShell } from "@/components/platform/PlatformShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ConciergeFab } from "@/components/ai/ConciergeFab";
import { IdleTimeout } from "@/components/platform/IdleTimeout";
import { MaintenanceBanner } from "@/components/platform/MaintenanceBanner";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getPlatformFlags } from "@/lib/platform/flags";
import { getUserSettings } from "@/lib/profile/queries";
import { DEFAULT_SETTINGS } from "@/lib/profile/settings";

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
  const { maintenance } = await getPlatformFlags();
  let onboardingDone = false;
  let ai = DEFAULT_SETTINGS.ai;
  if (me && configured()) {
    const supabase = createClient();
    const [{ data }, settings] = await Promise.all([
      supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", me.id)
        .maybeSingle<{ onboarding_completed: boolean }>(),
      getUserSettings(me.id),
    ]);
    onboardingDone = data?.onboarding_completed === true;
    ai = settings.ai;
  }

  return (
    <PlatformShell showSmartSearch={ai.search}>
      {maintenance && <MaintenanceBanner />}
      <IdleTimeout active={!!me} />
      <OnboardingGate initiallyComplete={onboardingDone} />
      {children}
      {ai.concierge && <ConciergeFab />}
    </PlatformShell>
  );
}
