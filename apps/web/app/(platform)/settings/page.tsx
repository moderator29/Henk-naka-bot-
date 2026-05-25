import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReplayOnboardingAction } from "@/components/onboarding/ReplayOnboardingAction";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { ConnectedWallets } from "@/components/settings/ConnectedWallets";
import { SubscriptionsSettings } from "@/components/settings/SubscriptionsSettings";
import { CreatorTiersSettings } from "@/components/settings/CreatorTiersSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { ContentFilters } from "@/components/settings/ContentFilters";
import { DataExport } from "@/components/settings/DataExport";
import { DangerZone } from "@/components/settings/DangerZone";
import { DEFAULT_SETTINGS, type UserSettings } from "@/lib/profile/settings";
import { getMySubscriptions, getMyTiers } from "@/lib/subscriptions/actions";
import { getBlockedUsers } from "@/lib/privacy/actions";
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
  let linkedWallet: string | null = null;
  const subscriptions = me ? await getMySubscriptions() : [];
  const blocked = me ? await getBlockedUsers() : [];
  const tiers = me ? await getMyTiers() : [];
  if (me && configured()) {
    const supabase = createClient();
    const [{ data }, { data: pref }] = await Promise.all([
      supabase
        .from("users")
        .select("display_name, username, bio, country, wallet_address")
        .eq("id", me.id)
        .maybeSingle<{
          display_name: string | null;
          username: string | null;
          bio: string | null;
          country: string | null;
          wallet_address: string | null;
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
      linkedWallet = data.wallet_address;
    }
    if (pref?.settings) {
      prefs = {
        notifications: { ...DEFAULT_SETTINGS.notifications, ...pref.settings.notifications },
        ai: { ...DEFAULT_SETTINGS.ai, ...pref.settings.ai },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...pref.settings.privacy },
        appearance: { ...DEFAULT_SETTINGS.appearance, ...pref.settings.appearance },
        hiddenCategories: pref.settings.hiddenCategories ?? DEFAULT_SETTINGS.hiddenCategories,
        language: pref.settings.language ?? DEFAULT_SETTINGS.language,
      };
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <header className="mb-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Manage your account, security, and how the platform works for you.
        </p>
      </header>

      <AccountSettings initial={initial} />
      <PrivacySettings initial={prefs.privacy} blocked={blocked} />
      <ContentFilters initial={prefs.hiddenCategories} />
      <ConnectedWallets linkedAddress={linkedWallet} />
      <CreatorTiersSettings tiers={tiers} />
      <SubscriptionsSettings subscriptions={subscriptions} />
      <PreferencesSettings initial={prefs} />
      <AppearanceSettings reduceMotion={prefs.appearance.reduceMotion} />
      <PasswordSettings />
      <DataExport />

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

      <Card className="edge-light flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Read the docs
          </h2>
          <p className="mt-1 text-sm text-lilac/60">
            Detailed guides for every part of the platform.
          </p>
        </div>
        <Button variant="glass" leftIcon={<BookOpen size={16} />} asChild>
          <Link href="/docs">Open docs</Link>
        </Button>
      </Card>

      <DangerZone />
    </div>
  );
}
