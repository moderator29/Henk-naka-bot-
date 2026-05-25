"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { sendWelcomeEmail } from "@/lib/email/resend";

/**
 * Persist onboarding completion to user_preferences (RLS restricts to self).
 * The first time it flips to complete we send the welcome email, which makes
 * "first real session" a clean, single trigger (no duplicate welcomes on
 * subsequent logins).
 */
export async function completeOnboarding(): Promise<void> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return;

  const supabase = createClient();
  const { data: prev } = await supabase
    .from("user_preferences")
    .select("onboarding_completed")
    .eq("user_id", me.id)
    .maybeSingle<{ onboarding_completed: boolean }>();
  const wasDone = prev?.onboarding_completed === true;

  await supabase.from("user_preferences").upsert(
    {
      user_id: me.id,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (!wasDone && me.email) await sendWelcomeEmail(me.email);
}
