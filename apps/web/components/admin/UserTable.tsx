"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { setUserRole, setAccountStatus } from "@/lib/admin/actions";
import type { AdminUserRow } from "@/lib/admin/queries";
import type { Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: Role[] = ["user", "creator", "moderator", "admin", "superadmin"];

export function UserTable({
  initial,
  query,
  canManageRoles,
  viewerRole,
}: {
  initial: AdminUserRow[];
  query: string;
  canManageRoles: boolean;
  viewerRole: Role;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [q, setQ] = useState(query);
  const [busyId, setBusyId] = useState<string | null>(null);

  const roleOptions = ROLE_OPTIONS.filter(
    (r) => r !== "superadmin" || viewerRole === "superadmin"
  );

  function search(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/users?q=${encodeURIComponent(q.trim())}`);
  }

  async function changeRole(u: AdminUserRow, role: Role) {
    setBusyId(u.id);
    const res = await setUserRole(u.id, role);
    setBusyId(null);
    if (res.ok) {
      push({ tone: "success", title: `Role set to ${role}` });
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Could not set role" });
    }
  }

  async function changeStatus(u: AdminUserRow, status: "active" | "suspended" | "banned") {
    setBusyId(u.id);
    const res = await setAccountStatus(u.id, status);
    setBusyId(null);
    if (res.ok) {
      push({ tone: "success", title: `Account ${status}` });
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Could not update account" });
    }
  }

  return (
    <div>
      <form onSubmit={search} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, @handle, or email"
            className="h-10 w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
          />
        </div>
        <Button type="submit" variant="glass">Search</Button>
      </form>

      {initial.length === 0 ? (
        <p className="text-sm text-lilac/60 py-8 text-center">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-[0.7rem] uppercase tracking-wider text-lilac/50">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initial.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={u.username ? `/creators/${u.username}` : "#"}
                        className="text-white font-medium hover:text-magenta-light truncate block max-w-[14rem]"
                      >
                        {u.displayName ?? u.username ?? "Unnamed"}
                      </Link>
                      <span className="text-xs text-lilac/45 truncate block max-w-[14rem]">
                        {u.username ? `@${u.username}` : u.email ?? u.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canManageRoles ? (
                      <select
                        aria-label={`Role for ${u.username ?? u.id}`}
                        value={u.role}
                        disabled={busyId === u.id}
                        onChange={(e) => changeRole(u, e.target.value as Role)}
                        className="h-8 rounded-lg bg-plum/60 border border-white/10 px-2 text-xs text-white focus:border-magenta/50 focus:outline-none"
                      >
                        {(roleOptions.includes(u.role) ? roleOptions : [u.role, ...roleOptions]).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-lilac/70">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[0.7rem] font-medium px-2 py-0.5 rounded-full",
                        u.accountStatus === "active"
                          ? "bg-cyan/15 text-cyan"
                          : u.accountStatus === "suspended"
                            ? "bg-yellow-500/15 text-yellow-300"
                            : "bg-red-500/15 text-red-300"
                      )}
                    >
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.accountStatus === "active" ? (
                        <>
                          <Button size="sm" variant="glass" loading={busyId === u.id} onClick={() => changeStatus(u, "suspended")}>
                            Suspend
                          </Button>
                          <Button size="sm" variant="glass" loading={busyId === u.id} onClick={() => changeStatus(u, "banned")}>
                            Ban
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="glass" loading={busyId === u.id} onClick={() => changeStatus(u, "active")}>
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
