import { getReports } from "@/lib/admin/queries";
import { ReportsQueue } from "@/components/admin/ReportsQueue";

export const metadata = { title: "Admin · Reports" };

export default async function AdminReportsPage() {
  const reports = await getReports();
  const open = reports.filter((r) => r.status === "open" || r.status === "reviewing");
  const closed = reports.filter((r) => r.status === "resolved" || r.status === "dismissed");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Reports &amp; moderation</h1>
      <p className="text-sm text-lilac/60 mb-6">
        Review reported content and users. Removing content hides it everywhere; actions are audit-logged.
      </p>
      <h2 className="text-xs uppercase tracking-wider text-lilac/50 mb-3">Open ({open.length})</h2>
      <ReportsQueue reports={open} />
      {closed.length > 0 && (
        <>
          <h2 className="text-xs uppercase tracking-wider text-lilac/50 mt-8 mb-3">Resolved ({closed.length})</h2>
          <ReportsQueue reports={closed} />
        </>
      )}
    </div>
  );
}
