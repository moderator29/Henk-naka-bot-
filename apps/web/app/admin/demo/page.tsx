import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyRole, atLeast } from "@/lib/auth/roles";
import { DemoPurgeButton } from "@/components/admin/DemoPurgeButton";

export const metadata = { title: "Admin · Demo data" };

export default async function AdminDemoPage() {
  if (!atLeast(await getMyRole(), "admin")) redirect("/admin");

  const counts = { users: 0, posts: 0, pveels: 0, listings: 0 };
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const [u, p, pv, l] = await Promise.all([
      admin.from("users").select("id", { count: "exact", head: true }).eq("is_demo", true),
      admin.from("posts").select("id", { count: "exact", head: true }).eq("is_demo", true),
      admin.from("pveels").select("id", { count: "exact", head: true }).eq("is_demo", true),
      admin.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("is_demo", true),
    ]);
    counts.users = u.count ?? 0;
    counts.posts = p.count ?? 0;
    counts.pveels = pv.count ?? 0;
    counts.listings = l.count ?? 0;
  }
  const total = counts.users + counts.posts + counts.pveels + counts.listings;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Demo data</h1>
      <p className="text-sm text-lilac/60 mb-6">
        Demo content is labeled and only shown when live data is empty. It purges automatically on the first real signup; you can also purge it now.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="glass edge-light rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-lilac/50">{k}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{v}</p>
          </div>
        ))}
      </div>
      <DemoPurgeButton count={total} />
    </div>
  );
}
