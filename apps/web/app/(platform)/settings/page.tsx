import { Card } from "@/components/ui/Card";
import { ReplayOnboardingAction } from "@/components/onboarding/ReplayOnboardingAction";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { MoreSettings } from "@/components/settings/MoreSettings";
import { SectionNav } from "@/components/settings/SectionNav";
import { DangerZone } from "@/components/settings/DangerZone";
import { DEFAULT_SETTINGS, type UserSettings } from "@/lib/profile/settings";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function SettingsPage() {
  const me = await getSessionUser();

  let initial = { displayName: "", username: "", bio: "", country: "" };
  let prefs: UserSettings = DEFAULT_SETTINGS;
  let dmPermission: "everyone" | "mutuals" = "everyone";
  let isCreator = false;
  if (me && configured()) {
    const supabase = createClient();
    const [{ data }, { data: pref }] = await Promise.all([
      supabase
        .from("users")
        .select("display_name, username, bio, country, dm_permission, is_creator")
        .eq("id", me.id)
        .maybeSingle<{
          display_name: string | null;
          username: string | null;
          bio: string | null;
          country: string | null;
          dm_permission: string | null;
          is_creator: boolean | null;
        }>(),
      supabase
        .from("user_preferences")
        .select("settings")
        .eq("user_id", me.id)
        .maybeSingle<{ settings: UserSettings | null }>(),
    ]);
    if (data) {
      initial = {
        displayName: data.display_name ?? "",
        username: data.username ?? "",
        bio: data.bio ?? "",
        country: data.country ?? "",
      };
      dmPermission = data.dm_permission === "mutuals" ? "mutuals" : "everyone";
      isCreator = data.is_creator ?? false;
    }
    if (pref?.settings) {
      prefs = {
        notifications: { ...DEFAULT_SETTINGS.notifications, ...pref.settings.notifications },
        ai: { ...DEFAULT_SETTINGS.ai, ...pref.settings.ai },
        language: pref.settings.language ?? DEFAULT_SETTINGS.language,
      };
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Manage your profile, account, privacy, and how the platform works for you.
        </p>
      </header>

      <div className="flex gap-8 items-start">
        <SectionNav />

        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div id="edit-profile">
            <AccountSettings initial={initial} />
          </div>

          <MoreSettings
            email={me?.email ?? null}
            dateOfBirth={me?.dateOfBirth ?? null}
            isCreator={isCreator}
          />

          <div id="privacy">
            <PrivacySettings dmPermission={dmPermission} />
          </div>
          <div id="notifications">
            <PreferencesSettings initial={prefs} />
          </div>
          <div id="password">
            <PasswordSettings />
          </div>

          <Card className="edge-light flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Replay the welcome tour
              </h2>
              <p className="mt-1 text-sm text-lilac/60">
                15 cards covering everything Pleasure Coin can do.
              </p>
            </div>
            <ReplayOnboardingAction />
          </Card>

          <div id="danger">
            <DangerZone />
          </div>
        </div>
      </div>
    </div>
  );
}
