"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Coins, Users, FileText, TrendingUp, Sparkles, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatTicker } from "@/components/ui/StatTicker";
import { cn, formatNumber } from "@/lib/utils";

export interface DashboardData {
  displayName: string;
  isCreator: boolean;
  totalEarnings: number;
  subscriberCount: number;
  postCount: number;
  tips30d: number;
  baselineMonthly: number;
  tiers: { id: string; name: string; price: number; active: boolean }[];
}

type Tab = "overview" | "earnings" | "tiers" | "fans";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "earnings", label: "Earnings" },
  { id: "tiers", label: "Tiers" },
  { id: "fans", label: "Fans" },
];

const fmt = (n: number) => formatNumber(Math.round(n));

export function DashboardView({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState<Tab>("overview");

  if (!data.isCreator) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="edge-light text-center py-16 flex flex-col items-center gap-4">
          <span className="h-14 w-14 rounded-2xl glass edge-light grid place-items-center text-magenta">
            <Crown size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Become a creator
            </h1>
            <p className="mt-1 text-sm text-lilac/60 max-w-sm">
              The creator dashboard, earnings forecaster, tiers, and Co-Pilot
              unlock once your creator profile is active.
            </p>
          </div>
          <Button asChild>
            <Link href="/settings">Get started</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-cyan">
          Creator dashboard
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Welcome back, {data.displayName}
        </h1>
      </header>

      <div role="tablist" className="flex items-center gap-1 border-b border-white/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              tab === t.id ? "text-white" : "text-lilac/60 hover:text-white"
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-gradient-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Coins} label="Total earnings">
            <StatTicker value={data.totalEarnings} format={fmt} suffix=" $NSFW" />
          </StatCard>
          <StatCard icon={Users} label="Subscribers">
            <StatTicker value={data.subscriberCount} format={fmt} />
          </StatCard>
          <StatCard icon={FileText} label="Posts">
            <StatTicker value={data.postCount} format={fmt} />
          </StatCard>
          <StatCard icon={TrendingUp} label="Est. monthly">
            <StatTicker value={data.baselineMonthly} format={fmt} suffix=" $NSFW" />
          </StatCard>
        </div>
      )}

      {tab === "earnings" && <Forecaster baseline={data.baselineMonthly} />}

      {tab === "tiers" && (
        <Card className="edge-light">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Subscription tiers
          </h2>
          {data.tiers.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.tiers.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-lilac/50">{t.active ? "Active" : "Hidden"}</p>
                  </div>
                  <span className="font-display font-semibold text-white">{fmt(t.price)} $NSFW</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lilac/60">
              You have no tiers yet. Set up tiers to let fans subscribe.
            </p>
          )}
        </Card>
      )}

      {tab === "fans" && (
        <Card className="edge-light">
          <h2 className="font-display text-lg font-semibold text-white mb-2">Fans</h2>
          <p className="text-sm text-lilac/70">
            You have <span className="text-white font-semibold">{fmt(data.subscriberCount)}</span> subscribers.
            Your subscriber list and per-fan insights appear here as they grow.
          </p>
        </Card>
      )}
    </div>
  );
}

function Forecaster({ baseline }: { baseline: number }) {
  const isExample = baseline <= 0;
  const base = isExample ? 5000 : baseline;
  const [subGrowth, setSubGrowth] = useState(10);
  const [tipGrowth, setTipGrowth] = useState(5);
  const [churn, setChurn] = useState(4);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loadingNarr, setLoadingNarr] = useState(false);

  const monthlyFactor = 1 + (subGrowth + tipGrowth) / 100 - churn / 100;
  const projected = base * monthlyFactor;

  const series = useMemo(
    () =>
      Array.from({ length: 7 }, (_, m) => ({
        month: m,
        value: Math.round(base * Math.pow(monthlyFactor, m)),
      })),
    [base, monthlyFactor]
  );

  async function generate() {
    setLoadingNarr(true);
    setNarrative(null);
    try {
      const res = await fetch("/api/ai/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, subGrowth, tipGrowth, churn, projected }),
      });
      const json = await res.json();
      setNarrative(
        json.narrative ??
          json.error ??
          "The AI narrative isn't available right now."
      );
    } catch {
      setNarrative("Couldn't reach the forecaster. Try again.");
    } finally {
      setLoadingNarr(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isExample && (
        <div className="text-xs text-cyan border border-cyan/30 rounded-xl px-3 py-2">
          <span className="uppercase tracking-wider font-medium">Example</span>{" "}
          <span className="text-lilac/60">
            Showing a sample baseline until you have live earnings. Your real
            numbers fill in as subscriptions and tips come through.
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <Card className="edge-light flex flex-col gap-5">
          <h2 className="font-display text-lg font-semibold text-white">
            Scenario
          </h2>
          <Slider label="Subscriber growth" value={subGrowth} set={setSubGrowth} max={50} suffix="%/mo" />
          <Slider label="Tip growth" value={tipGrowth} set={setTipGrowth} max={50} suffix="%/mo" />
          <Slider label="Churn" value={churn} set={setChurn} max={20} suffix="%/mo" />
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-lilac/50">Projected next month</div>
            <div className="font-display text-3xl font-semibold text-white tabular-nums">
              {fmt(projected)} <span className="text-gradient">$NSFW</span>
            </div>
            <div className="text-xs text-lilac/50 mt-1">
              from a {fmt(base)} $NSFW baseline
            </div>
          </div>
        </Card>

        <Card className="edge-light flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-white">
            6-month projection
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <XAxis dataKey="month" tickFormatter={(m) => (m === 0 ? "Now" : `M${m}`)} tick={{ fill: "#7A6B95", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Tooltip
                  contentStyle={{ background: "#16092E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                  labelFormatter={(m) => (m === 0 ? "Now" : `Month ${m}`)}
                  formatter={(v) => [`${fmt(Number(v))} $NSFW`, "Projected"]}
                />
                <Line type="monotone" dataKey="value" stroke="#FF1F8F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-white mb-1">
              <Sparkles size={14} className="text-magenta" /> AI read
            </div>
            {narrative ? (
              <p className="text-sm text-lilac/75">{narrative}</p>
            ) : (
              <Button size="sm" variant="glass" loading={loadingNarr} onClick={generate}>
                Generate AI narrative
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  set,
  max,
  suffix,
}: {
  label: string;
  value: number;
  set: (v: number) => void;
  max: number;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-lilac/80">{label}</span>
        <span className="text-white font-medium tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full accent-magenta"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Coins;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="edge-light flex flex-col gap-2">
      <div className="flex items-center gap-2 text-lilac/50">
        <Icon size={15} aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display text-2xl font-semibold text-white tabular-nums">
        {children}
      </div>
    </Card>
  );
}
