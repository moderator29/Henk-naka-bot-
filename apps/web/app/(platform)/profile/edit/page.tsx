import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit profile" };

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function EditProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login?next=/profile/edit");

  let initial = {
    displayName: "",
    username: "",
    bio: "",
    telegramUrl: null as string | null,
    xUrl: null as string | null,
    avatarUrl: null as string | null,
    coverUrl: null as string | null,
  };

  if (configured()) {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("display_name, username, bio, telegram_url, x_url, avatar_url, cover_url")
      .eq("id", me.id)
      .maybeSingle<{
        display_name: string | null;
        username: string | null;
        bio: string | null;
        telegram_url: string | null;
        x_url: string | null;
        avatar_url: string | null;
        cover_url: string | null;
      }>();
    if (data) {
      initial = {
        displayName: data.display_name ?? "",
        username: data.username ?? "",
        bio: data.bio ?? "",
        telegramUrl: data.telegram_url,
        xUrl: data.x_url,
        avatarUrl: data.avatar_url,
        coverUrl: data.cover_url,
      };
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Back to profile"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Edit <span className="text-gradient">profile</span>
        </h1>
      </header>
      <EditProfileForm initial={initial} />
    </div>
  );
}
