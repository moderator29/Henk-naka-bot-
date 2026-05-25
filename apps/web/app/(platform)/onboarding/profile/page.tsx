import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProfileSetupForm } from "@/components/auth/ProfileSetupForm";

export const metadata = { title: "Set up your profile" };

/**
 * First-time profile setup, primarily for wallet-first accounts that have no
 * username yet. If the profile is already set up, skip straight into the app.
 */
export default async function ProfileSetupPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/onboarding/profile");

  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("username")
    .eq("id", me.id)
    .maybeSingle<{ username: string | null }>();
  if (data?.username) redirect("/explore");

  return (
    <div className="max-w-lg mx-auto py-4">
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-white">
          Set up your <span className="text-gradient">profile</span>
        </h1>
        <p className="mt-2 text-sm text-lilac/65">
          Pick a username and tell people who you are. You can change this
          anytime in settings.
        </p>
      </header>
      <ProfileSetupForm />
    </div>
  );
}
