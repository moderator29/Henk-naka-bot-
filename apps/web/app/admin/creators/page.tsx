import { listApplications } from "@/lib/admin/queries";
import { ApplicationQueue } from "@/components/admin/ApplicationQueue";

export const metadata = { title: "Creators · Admin" };

const STATUSES = ["pending", "approved", "rejected"] as const;

export default async function AdminCreatorsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status =
    STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
      ? (searchParams.status as (typeof STATUSES)[number])
      : "pending";
  const applications = await listApplications(status);

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Creators</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Review creator applications. Approving promotes the account and opens
          the creator tools.
        </p>
      </header>
      <ApplicationQueue initial={applications} status={status} statuses={[...STATUSES]} />
    </div>
  );
}
