import { listUsers } from "@/lib/admin/queries";
import { getMyRole, isAdminRole } from "@/lib/auth/roles";
import { UserTable } from "@/components/admin/UserTable";

export const metadata = { title: "Users · Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const [users, role] = await Promise.all([listUsers(q), getMyRole()]);

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Search, change roles, and suspend or ban accounts.
        </p>
      </header>
      <UserTable
        initial={users}
        query={q}
        canManageRoles={isAdminRole(role)}
        viewerRole={role}
      />
    </div>
  );
}
