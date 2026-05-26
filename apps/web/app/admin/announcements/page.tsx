import { redirect } from "next/navigation";
import { getMyRole, isAdminRole } from "@/lib/auth/roles";
import { listNews } from "@/lib/news/queries";
import { BroadcastComposer } from "@/components/admin/BroadcastComposer";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Announcements · Admin" };

export default async function AdminAnnouncementsPage() {
  const role = await getMyRole();
  if (!isAdminRole(role)) redirect("/admin");

  const recent = await listNews();

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Announcements</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Broadcast platform news to users via the in-app feed, their
          notifications, and email.
        </p>
      </header>

      <BroadcastComposer />

      <h2 className="font-display text-sm font-semibold text-white mt-8 mb-3">
        Recent broadcasts
      </h2>
      {recent.length === 0 ? (
        <p className="text-sm text-lilac/60">No broadcasts yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recent.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{n.title}</p>
                <p className="text-xs text-lilac/50 truncate">{n.body}</p>
              </div>
              <span className="text-[0.7rem] text-lilac/40 whitespace-nowrap">
                {n.likes} likes · {n.comments} comments · {relativeTime(n.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
