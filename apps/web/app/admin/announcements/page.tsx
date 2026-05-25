import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyRole, atLeast } from "@/lib/auth/roles";
import { relativeTime } from "@/lib/utils";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export const metadata = { title: "Admin · Announcements" };

export default async function AdminAnnouncementsPage() {
  if (!atLeast(await getMyRole(), "admin")) redirect("/admin");

  let recent: { id: string; title: string; body: string; audience: string; created_at: string }[] = [];
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data } = await createAdminClient()
      .from("announcements")
      .select("id, title, body, audience, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    recent = (data ?? []) as typeof recent;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Announcements</h1>
      <p className="text-sm text-lilac/60 mb-6">Post platform-wide or targeted announcements.</p>
      <AnnouncementForm />
      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-wider text-lilac/50 mb-3">Recent</h2>
          <ul className="flex flex-col gap-2">
            {recent.map((a) => (
              <li key={a.id} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{a.title}</span>
                  <span className="text-[0.6rem] uppercase tracking-wider text-lilac/45">{a.audience}</span>
                  <span className="ml-auto text-xs text-lilac/40">{relativeTime(a.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-lilac/70">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
