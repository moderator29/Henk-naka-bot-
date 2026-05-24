"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lock, TrendingUp, Wallet, Coins, Timer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatTicker } from "@/components/ui/StatTicker";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { useToast } from "@/components/ui/Toast";
import { useNsfwBalance } from "@/lib/web3/useNsfwBalance";
import { cn, formatNumber } from "@/lib/utils";
import {
  STAKING_APY,
  STAKING_LOCK_WEEKS,
  STAKING_IS_MOCK,
  MOCK_TOTAL_STAKED,
  lockUnlockFrom,
  projectedRewards,
  accruedRewards,
  projectionSeries,
  type StakePosition,
} from "@/lib/staking/mock";

type TxStage = "idle" | "awaiting" | "pending" | "success" | "error";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmt = (n: number) => formatNumber(Math.round(n));
const dateFmt = (ms: number) =>
  new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function countdown(toMs: number, now: number): string {
  const ms = toMs - now;
  if (ms <= 0) return "Unlocked";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function StakingDashboard() {
  const { isConnected } = useAccount();
  const { formatted, isLoading } = useNsfwBalance();
  const { push } = useToast();

  const balance = Number(formatted || 0);
  const [positions, setPositions] = useState<StakePosition[]>([]);
  const [amount, setAmount] = useState("");
  const [stakeStage, setStakeStage] = useState<TxStage>("idle");
  const [claimBusy, setClaimBusy] = useState(false);
  const [busyUnstake, setBusyUnstake] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Live tick for countdowns + reward accrual.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const userStaked = positions.reduce((s, p) => s + p.amount, 0);
  const pendingRewards = positions.reduce((s, p) => s + accruedRewards(p, now), 0);
  const totalStaked = MOCK_TOTAL_STAKED + userStaked;

  const amountNum = Number(amount) || 0;
  const amountValid = amountNum > 0 && amountNum <= balance;
  const unlockPreview = useMemo(() => lockUnlockFrom(), []);
  const chartData = useMemo(
    () => projectionSeries(amountNum > 0 ? amountNum : userStaked),
    [amountNum, userStaked]
  );

  const staking = stakeStage === "awaiting" || stakeStage === "pending";

  async function handleStake() {
    if (!amountValid || staking) return;
    try {
      setStakeStage("awaiting");
      await wait(700);
      setStakeStage("pending");
      await wait(1400);
      const stakedAt = Date.now();
      setPositions((p) => [
        { id: Math.random().toString(36).slice(2), amount: amountNum, stakedAt, unlockAt: lockUnlockFrom(stakedAt) },
        ...p,
      ]);
      setAmount("");
      setStakeStage("success");
      push({ tone: "success", title: "Staked", description: `${fmt(amountNum)} $NSFW locked for ${STAKING_LOCK_WEEKS} weeks.` });
      await wait(1200);
      setStakeStage("idle");
    } catch {
      setStakeStage("error");
      push({ tone: "error", title: "Stake failed", description: "Something went wrong. Try again." });
    }
  }

  async function handleClaim() {
    if (claimBusy || pendingRewards <= 0) return;
    setClaimBusy(true);
    const claimed = pendingRewards;
    await wait(700);
    await wait(1200);
    // Reset accrual by restarting each position's clock.
    setPositions((p) => p.map((x) => ({ ...x, stakedAt: Date.now() })));
    setClaimBusy(false);
    push({ tone: "success", title: "Rewards claimed", description: `${fmt(claimed)} $NSFW sent to your wallet.` });
  }

  async function handleUnstake(id: string) {
    if (busyUnstake) return;
    setBusyUnstake(id);
    await wait(700);
    await wait(1400);
    setPositions((p) => p.filter((x) => x.id !== id));
    setBusyUnstake(null);
    push({ tone: "success", title: "Unstaked", description: "Your $NSFW has been returned." });
  }

  const stakeLabel =
    stakeStage === "awaiting"
      ? "Confirm in wallet…"
      : stakeStage === "pending"
        ? "Staking…"
        : "Stake $NSFW";

  return (
    <div className="flex flex-col gap-6">
      {STAKING_IS_MOCK && (
        <div className="flex items-center gap-2 text-xs text-cyan border border-cyan/30 rounded-xl px-3 py-2">
          <span className="uppercase tracking-wider font-medium">Preview</span>
          <span className="text-lilac/60">
            Figures are illustrative until the staking contract address is wired
            (<span className="font-mono">PENDING_CONTRACT_ADDRESS</span>).
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Current APY">
          <StatTicker value={STAKING_APY * 100} format={(n) => `${n.toFixed(0)}%`} />
        </StatCard>
        <StatCard icon={Coins} label="Total staked">
          <StatTicker value={totalStaked} format={fmt} suffix=" $NSFW" />
        </StatCard>
        <StatCard icon={Lock} label="Lock period">
          <span className="font-display text-2xl font-semibold text-white">
            {STAKING_LOCK_WEEKS} weeks
          </span>
        </StatCard>
        <StatCard icon={Wallet} label="Your staked">
          <StatTicker value={userStaked} format={fmt} suffix=" $NSFW" />
        </StatCard>
      </div>

      {!isConnected ? (
        <Card className="text-center py-14 flex flex-col items-center gap-4 edge-light">
          <span className="h-14 w-14 rounded-2xl glass edge-light flex items-center justify-center text-magenta">
            <Wallet size={26} />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Connect your wallet to stake
            </h2>
            <p className="mt-1 text-sm text-lilac/60 max-w-sm">
              View your balance, stake $NSFW, track your lock, and claim rewards.
            </p>
          </div>
          <ConnectWallet />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Stake panel */}
          <Card className="edge-light flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Stake</h2>
              <span className="text-xs text-lilac/50">
                Balance: {isLoading ? "…" : fmt(balance)} $NSFW
              </span>
            </div>
            <div className="relative">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.0"
                className="h-12 w-full rounded-xl bg-plum/60 border border-white/10 pl-4 pr-20 text-lg text-white placeholder:text-lilac/30 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
              />
              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(balance)))}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-lg text-xs font-semibold bg-white/5 text-lilac/80 hover:text-white"
              >
                MAX
              </button>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-sm flex flex-col gap-2">
              <Row label="Lock period" value={`${STAKING_LOCK_WEEKS} weeks`} />
              <Row label="Unlocks on" value={dateFmt(unlockPreview)} />
              <Row
                label={`Projected rewards (${(STAKING_APY * 100).toFixed(0)}% APY)`}
                value={`${fmt(projectedRewards(amountNum))} $NSFW`}
                accent
              />
            </div>

            {amount && !amountValid && (
              <p className="text-xs text-red-400">
                {amountNum > balance ? "Amount exceeds your balance." : "Enter an amount greater than zero."}
              </p>
            )}

            <Button onClick={handleStake} loading={staking} disabled={!amountValid || staking} size="lg" className="w-full">
              {stakeLabel}
            </Button>
          </Card>

          {/* Claim + projection */}
          <Card className="edge-light flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold text-white">Rewards</h2>
            <div>
              <div className="text-xs uppercase tracking-wider text-lilac/50">Claimable now</div>
              <div className="font-display text-3xl font-semibold text-white tabular-nums">
                {pendingRewards.toFixed(4)} <span className="text-gradient">$NSFW</span>
              </div>
            </div>
            <Button onClick={handleClaim} loading={claimBusy} disabled={pendingRewards <= 0 || claimBusy} variant="glass" className="w-full">
              {claimBusy ? "Claiming…" : "Claim rewards"}
            </Button>
            <div className="mt-2">
              <div className="text-xs uppercase tracking-wider text-lilac/50 mb-2">
                Growth at {(STAKING_APY * 100).toFixed(0)}% APY
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <XAxis dataKey="week" tick={{ fill: "#7A6B95", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      contentStyle={{ background: "#16092E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                      labelFormatter={(w) => `Week ${w}`}
                      formatter={(value) => [`${fmt(Number(value))} $NSFW`, "Value"]}
                    />
                    <Line type="monotone" dataKey="value" stroke="#FF1F8F" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Positions */}
      {isConnected && positions.length > 0 && (
        <Card className="edge-light">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Your positions</h2>
          <div className="flex flex-col gap-3">
            {positions.map((p) => {
              const unlocked = now >= p.unlockAt;
              const busy = busyUnstake === p.id;
              return (
                <div key={p.id} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex flex-wrap items-center gap-4">
                  <div className="min-w-[120px]">
                    <div className="text-xs text-lilac/50">Staked</div>
                    <div className="font-display text-lg font-semibold text-white">{fmt(p.amount)} $NSFW</div>
                  </div>
                  <div className="min-w-[110px]">
                    <div className="text-xs text-lilac/50">Started</div>
                    <div className="text-sm text-lilac/80">{dateFmt(p.stakedAt)}</div>
                  </div>
                  <div className="min-w-[120px]">
                    <div className="text-xs text-lilac/50 flex items-center gap-1">
                      <Timer size={11} /> {unlocked ? "Status" : "Unlocks in"}
                    </div>
                    <div className={cn("text-sm tabular-nums", unlocked ? "text-emerald-400" : "text-lilac/80")}>
                      {countdown(p.unlockAt, now)}
                    </div>
                  </div>
                  <div className="min-w-[120px]">
                    <div className="text-xs text-lilac/50">Rewards accrued</div>
                    <div className="text-sm text-magenta tabular-nums">{accruedRewards(p, now).toFixed(4)}</div>
                  </div>
                  <div className="ml-auto">
                    <Button
                      size="sm"
                      variant="glass"
                      loading={busy}
                      disabled={!unlocked || busy}
                      onClick={() => handleUnstake(p.id)}
                    >
                      {unlocked ? "Unstake" : "Locked"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Lock;
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

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-lilac/60">{label}</span>
      <span className={cn("font-medium", accent ? "text-magenta" : "text-white")}>{value}</span>
    </div>
  );
}
