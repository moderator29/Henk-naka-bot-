import Link from "next/link";
import { Users, BadgeCheck, FileText, Clapperboard, CreditCard, Flag, Coins, FlaskConical } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Admin · Overview" };

function adminConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function countAll(): Promise<Record<string, number | null>> {
  if (!adminConfigured()) {
    return {
      users: null, creators: null, posts: null, pveels: null,
      activeSubs: null, openReports: null, tips: null, demo: null,
    };
  }
  const admin = createAdminClient();
  const head = (q: PromiseLike<{ count: number | null }>) => q;
  const nowIso = new Date().toISOString();
  const [users, creators, posts, pveels, activeSubs, openReports, tips, demoPosts, demoPveels] =
    await Promise.all([
      head(admin.from("users").select("id", { count: "exact", head: true })),
      head(admin.from("users").select("id", { count: "exact", head: true }).eq("is_creator", true)),
      head(admin.from("posts").select("id", { count: "exact", head: true })),
      head(admin.from("pveels").select("id", { count: "exact", head: true })),
      head(admin.from("subscriptions").select("id", { count: "exact", head: true }).gt("expires_at", nowIso)),
      head(admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "open")),
      head(admin.from("tips").select("id", { count: "exact", head: true })),
      head(admin.from("posts").select("id", { count: "exact", head: true }).eq("is_demo", true)),
      head(admin.from("pveels").select("id", { count: "exact", head: true }).eq("is_demo", true)),
    ]);
  return {
    users: users.count ?? 0,
    creators: creators.count ?? 0,
    posts: posts.count ?? 0,
    pveels: pveels.count ?? 0,
    activeSubs: activeSubs.count ?? 0,
    openReports: openReports.count ?? 0,
    tips: tips.count ?? 0,
    demo: (demoPosts.count ?? 0) + (demoPveels.count ?? 0),
  };
}

type Card = { key: string; label: string; icon: typeof Users; href?: string; alert?: boolean };

const CARDS: Card[] = [
  { key: "users", label: "Users", icon: Users },
  { key: "creators", label: "Creators", icon: BadgeCheck },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "pveels", label: "Pveels", icon: Clapperboard },
  { key: "activeSubs", label: "Active subscriptions", icon: CreditCard },
  { key: "tips", label: "Tips", icon: Coins },
  { key: "openReports", label: "Open reports", icon: Flag, href: "/admin/reports", alert: true },
  { key: "demo", label: "Demo items", icon: FlaskConical },
];

export default async function AdminOverview() {
  const m = await countAll();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Overview</h1>
      <p className="text-sm text-lilac/60 mb-6">Live platform metrics. Real counts from the database.</p>

      {!adminConfigured() && (
        <p className="mb-6 text-sm text-lilac/60 rounded-xl glass px-4 py-3">
          Metrics need the Supabase service role key set on the server.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((c) => {
          const value = m[c.key];
          const Icon = c.icon;
          const body = (
            <div
              className={`glass edge-light rounded-2xl p-5 ${c.alert && (value ?? 0) > 0 ? "border border-magenta/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-lilac/50">{c.label}</span>
                <Icon size={16} className={c.alert && (value ?? 0) > 0 ? "text-magenta" : "text-lilac/40"} />
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-white">
                {value == null ? "—" : value.toLocaleString()}
              </div>
            </div>
          );
          return c.href ? (
            <Link key={c.key} href={c.href}>{body}</Link>
          ) : (
            <div key={c.key}>{body}</div>
          );
        })}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        <Link href="/admin/reports" className="glass edge-light rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
          <h2 className="font-display font-semibold text-white">Moderation queue</h2>
          <p className="text-sm text-lilac/60 mt-1">Review reported content and users, take action.</p>
        </Link>
        <Link href="/admin/users" className="glass edge-light rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
          <h2 className="font-display font-semibold text-white">User management</h2>
          <p className="text-sm text-lilac/60 mt-1">Search users, change roles, suspend, verify.</p>
        </Link>
      </div>
    </div>
  );
}
