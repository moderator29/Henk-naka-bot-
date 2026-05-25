import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getMyRole, atLeast } from "@/lib/auth/roles";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

/**
 * Admin panel gate. Access requires the moderator role or higher, enforced
 * server-side here (and again in each admin action). Anyone else is bounced to
 * the app, so /admin is never reachable by hiding-only.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getMyRole();
  if (!atLeast(role, "moderator")) redirect("/feed");
  return <AdminShell role={role}>{children}</AdminShell>;
}
