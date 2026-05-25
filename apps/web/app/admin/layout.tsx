import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getMyRole, isStaffRole } from "@/lib/auth/roles";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: "Admin · Pleasure Coin" };

/**
 * Server-side gate for the whole admin area. Anonymous users go to login;
 * signed-in non-staff are bounced to the app. The role check is here (not just
 * in the UI) so /admin and its children are protected at the server.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  const role = await getMyRole();
  if (!isStaffRole(role)) redirect("/");

  return (
    <div className="min-h-screen bg-plum text-white flex">
      <AdminSidebar role={role} email={user.email} />
      <main className="flex-1 min-w-0 px-5 sm:px-8 py-8 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
