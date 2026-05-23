import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Card } from "@/components/ui/Card";
import { WalletBalanceCard } from "@/components/staking/WalletBalanceCard";
import { STAKING_CONTRACT_ADDRESS } from "@/lib/web3/addresses";
import { isStakingDeployed } from "@aurora/contracts";

export default function StakingPage() {
  const deployed = isStakingDeployed(STAKING_CONTRACT_ADDRESS);

  return (
    <div className="max-w-5xl mx-auto">
      <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 mb-8">
        <AuroraBackground variant="purple" intensity="subtle" />
        <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan">
              12-Week Staking
            </span>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold text-white">
              Stake $NSFW.{" "}
              <span className="text-gradient">Earn rewards.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lilac/70">
              Connect your wallet to view your position, claim rewards, and
              manage your stake.
            </p>
          </div>
          <BrandIcon name="lock" size={140} />
        </div>
      </section>

      <div className="mb-6">
        <WalletBalanceCard />
      </div>

      {!deployed && (
        <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
          <h2 className="font-display text-xl font-semibold text-white mb-2">
            Staking actions activate when the contract address is provided
          </h2>
          <p className="text-lilac/60 text-sm max-w-md mx-auto font-mono">
            STAKING_CONTRACT_ADDRESS = PENDING_CONTRACT_ADDRESS
          </p>
          <p className="text-lilac/40 text-xs mt-4 max-w-md mx-auto">
            The UI is built against a typed interface matching the expected
            contract shape. Provide the address to wire it up.
          </p>
        </Card>
      )}
    </div>
  );
}
