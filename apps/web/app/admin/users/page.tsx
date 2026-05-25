import { getUsers } from "@/lib/admin/queries";
import { getMyRole, atLeast } from "@/lib/auth/roles";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const [users, role] = await Promise.all([getUsers(q), getMyRole()]);
  const canSetRoles = atLeast(role, "admin");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-sm text-lilac/60 mb-5">
        Search and manage users. {canSetRoles ? "Change roles, suspend, or unsuspend." : "Suspend or unsuspend; role changes need an admin."}
      </p>
      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, @username, or email"
          className="h-11 w-full max-w-md rounded-xl bg-plum/60 border border-white/10 px-4 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
        />
      </form>
      <UsersTable users={users} canSetRoles={canSetRoles} />
    </div>
  );
}
