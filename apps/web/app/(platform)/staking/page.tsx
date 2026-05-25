import {
  TrendingUp,
  CalendarDays,
  Unlock,
  RefreshCw,
  Coins,
  Fuel,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { StakingDashboard } from "@/components/staking/StakingDashboard";

export const metadata = { title: "Staking" };

const RULES = [
  { icon: TrendingUp, text: "Lock your $NSFW for 12 weeks and earn 10% APY." },
  { icon: CalendarDays, text: "Rewards accrue continuously and can be claimed every Monday." },
  { icon: Unlock, text: "To unstake: request unlock, wait out the lock, then withdraw." },
  { icon: RefreshCw, text: "Adding more tokens resets your 12-week lock period." },
  { icon: Coins, text: "Minimum stake is 1,000,000 $NSFW." },
  { icon: Fuel, text: "Keep a little POL in your wallet for transaction fees." },
];

export default function StakingPage() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <section className="relative grid md:grid-cols-[1fr_auto] items-center gap-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan">
            12-week staking
          </span>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold text-white">
            Stake $NSFW.{" "}
            <span className="text-gradient">Earn 10% APY.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lilac/70">
            Lock your $NSFW for 12 weeks and earn rewards. Connect your wallet to
            stake, track your position, and claim.
          </p>
        </div>
        <BrandIcon name="lock" size={120} />
      </section>

      <StakingDashboard />

      <section className="glass edge-light rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-white">
          About <span className="text-gradient">12-week staking</span>
        </h2>
        <p className="mt-1 text-sm text-lilac/60">
          How the staking program works, in plain terms.
        </p>
        <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {RULES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="h-9 w-9 shrink-0 rounded-xl glass edge-light grid place-items-center text-magenta">
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="text-sm text-lilac/85 leading-relaxed pt-1.5">
                {text}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
