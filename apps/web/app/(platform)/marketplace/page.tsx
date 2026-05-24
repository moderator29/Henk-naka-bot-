import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";

export const metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          <span className="text-gradient">PleasureNifty</span> marketplace
        </h1>
        <p className="mt-2 text-lilac/70">
          Creator NFTs on Polygon. Browse, buy, list, all priced in $NSFW.
        </p>
      </header>

      <MarketplaceBrowser />
    </div>
  );
}
