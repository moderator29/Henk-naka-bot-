import { listReports } from "@/lib/admin/queries";
import { ReportQueue } from "@/components/admin/ReportQueue";

export const metadata = { title: "Moderation · Admin" };

const STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status =
    STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
      ? (searchParams.status as (typeof STATUSES)[number])
      : "open";
  const reports = await listReports(status);

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Moderation</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Reported posts, comments, profiles, and users. Triage and resolve.
        </p>
      </header>
      <ReportQueue initial={reports} status={status} statuses={[...STATUSES]} />
    </div>
  );
}
