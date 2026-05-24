import { BrandIcon } from "@/components/brand/BrandIcon";
import { StakingDashboard } from "@/components/staking/StakingDashboard";

export const metadata = { title: "Staking" };

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
    </div>
  );
}
