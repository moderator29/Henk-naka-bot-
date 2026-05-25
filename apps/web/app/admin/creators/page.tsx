import { redirect } from "next/navigation";
import { getUsers } from "@/lib/admin/queries";
import { getMyRole, atLeast } from "@/lib/auth/roles";
import { CreatorsTable } from "@/components/admin/CreatorsTable";

export const metadata = { title: "Admin · Creators" };

export default async function AdminCreatorsPage() {
  if (!atLeast(await getMyRole(), "admin")) redirect("/admin");
  const creators = await getUsers(undefined, true);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Creators</h1>
      <p className="text-sm text-lilac/60 mb-6">
        Everyone with a published tier is a creator. Verify them to grant the blue badge.
      </p>
      <CreatorsTable creators={creators} />
    </div>
  );
}
