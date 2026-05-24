import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReplayOnboardingAction } from "@/components/onboarding/ReplayOnboardingAction";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { DangerZone } from "@/components/settings/DangerZone";
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
  if (me && configured()) {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("display_name, username, bio, country")
      .eq("id", me.id)
      .maybeSingle<{
        display_name: string | null;
        username: string | null;
        bio: string | null;
        country: string | null;
      }>();
    if (data) {
      initial = {
        displayName: data.display_name ?? "",
        username: data.username ?? "",
        bio: data.bio ?? "",
        country: data.country ?? "",
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
      <PasswordSettings />

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
