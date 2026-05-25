import { Users, BadgeCheck, FileText, Heart, Coins, Flag, UserPlus, Inbox } from "lucide-react";
import { getAdminOverview } from "@/lib/admin/queries";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Overview · Admin" };

export default async function AdminOverviewPage() {
  const o = await getAdminOverview();

  const stats = [
    { label: "Total users", value: o.totalUsers, icon: Users },
    { label: "Creators", value: o.totalCreators, icon: BadgeCheck },
    { label: "New (7d)", value: o.newUsers7d, icon: UserPlus },
    { label: "Posts", value: o.totalPosts, icon: FileText },
    { label: "Active subs", value: o.activeSubscriptions, icon: Heart },
    { label: "Tips ($NSFW)", value: Math.round(o.tipsVolumeNsfw), icon: Coins },
    { label: "Open reports", value: o.openReports, icon: Flag, alert: o.openReports > 0 },
    { label: "Pending creators", value: o.pendingApplications, icon: Inbox, alert: o.pendingApplications > 0 },
  ];

  return (
    <div className="max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Live platform metrics, straight from the database.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-wider text-lilac/50">
                {s.label}
              </span>
              <s.icon size={15} className={s.alert ? "text-magenta" : "text-lilac/40"} />
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
              {formatNumber(s.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-display text-sm font-semibold text-white mb-4">
          Signups, last 7 days
        </h2>
        <SignupsChart data={o.signups} />
      </div>
    </div>
  );
}
