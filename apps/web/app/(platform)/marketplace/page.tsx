import { Card } from "@/components/ui/Card";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { isMarketplaceWired } from "@/lib/web3/addresses";

export default function MarketplacePage() {
  const wired = isMarketplaceWired;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          <span className="text-gradient">PleasureNifty</span> marketplace
        </h1>
        <p className="mt-2 text-lilac/70">
          Creator NFTs on Polygon. Browse, buy, list — all priced in $NSFW.
        </p>
      </header>

      {!wired && (
        <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
          <div className="flex justify-center mb-6">
            <BrandIcon name="diamond" size={80} />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">
            Marketplace wires up once NFT contracts are deployed
          </h2>
          <p className="text-lilac/60 text-sm max-w-md mx-auto font-mono">
            PENDING_CONTRACT_ADDRESS — set NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES
            to enable.
          </p>
        </Card>
      )}
    </div>
  );
}
