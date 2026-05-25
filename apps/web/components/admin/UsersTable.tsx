"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { suspendUser, setUserRole, type AdminResult } from "@/lib/admin/actions";
import type { AdminUser } from "@/lib/admin/queries";
import type { Role } from "@/lib/auth/roles";

const ROLES: Role[] = ["user", "creator", "moderator", "admin", "superadmin"];

export function UsersTable({ users, canSetRoles }: { users: AdminUser[]; canSetRoles: boolean }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<AdminResult>, ok: string) {
    setBusy(key);
    const res = await fn();
    setBusy(null);
    push(res.ok ? { tone: "success", title: ok } : { tone: "error", title: res.error ?? "Failed" });
    if (res.ok) router.refresh();
  }

  if (users.length === 0) return <p className="text-sm text-lilac/55">No users found.</p>;

  return (
    <div className="flex flex-col gap-2">
      {users.map((u) => (
        <div key={u.id} className="glass edge-light rounded-xl p-3 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {u.displayName ?? u.username ?? "User"}
              {u.isDemo && <span className="ml-2 text-[0.6rem] uppercase tracking-wider text-lilac/40">demo</span>}
              {u.isSuspended && <span className="ml-2 text-[0.6rem] uppercase tracking-wider text-red-400">suspended</span>}
            </p>
            <p className="text-xs text-lilac/50 truncate">
              {u.username ? `@${u.username}` : u.email ?? u.id.slice(0, 8)} · {u.role}
            </p>
          </div>
          {u.username && (
            <Link href={`/creators/${u.username}`} className="text-xs text-lilac/60 hover:text-white">View</Link>
          )}
          {canSetRoles && (
            <select
              value={u.role}
              onChange={(e) => run(`role-${u.id}`, () => setUserRole(u.id, e.target.value as Role), "Role updated")}
              disabled={busy === `role-${u.id}`}
              className="h-8 rounded-lg bg-plum/60 border border-white/10 px-2 text-xs text-white focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          )}
          <Button
            size="sm"
            variant="glass"
            className={u.isSuspended ? "" : "text-red-300"}
            loading={busy === `sus-${u.id}`}
            onClick={() => run(`sus-${u.id}`, () => suspendUser(u.id, !u.isSuspended), u.isSuspended ? "Unsuspended" : "Suspended")}
          >
            {u.isSuspended ? "Unsuspend" : "Suspend"}
          </Button>
        </div>
      ))}
    </div>
  );
}
