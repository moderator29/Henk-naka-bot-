import { listAnnouncements } from "@/lib/admin/queries";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";

export const metadata = { title: "Announcements · Admin" };

export default async function AdminAnnouncementsPage() {
  const announcements = await listAnnouncements();
  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Announcements</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Post a platform announcement. It also notifies the chosen audience.
        </p>
      </header>
      <AnnouncementManager initial={announcements} />
    </div>
  );
}
