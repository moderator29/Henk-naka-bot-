import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CopyAddress } from "@/components/marketing/CopyAddress";
import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";

const linkGroups = [
  {
    title: "Platform",
    links: [
      { href: "/explore", label: "Discover" },
      { href: "/feed", label: "Feed" },
      { href: "/messages", label: "Messages" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/staking", label: "Staking" },
    ],
  },
  {
    title: "Token",
    links: [
      { href: "/token", label: "$NSFW" },
      { href: "https://app.sushi.com", label: "Buy on SushiSwap", external: true },
      { href: "https://www.coingecko.com", label: "CoinGecko", external: true },
      { href: "https://coinmarketcap.com", label: "CoinMarketCap", external: true },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/journey", label: "Journey" },
      { href: "/docs", label: "Documentation" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/dmca", label: "DMCA" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/5 bg-plum/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-lilac/60 max-w-xs">
              The unified creator platform. AI-native. Polygon-powered.
            </p>
            <CopyAddress
              address={NSFW_TOKEN_ADDRESS}
              label="$NSFW contract"
            />
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-display text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => {
                  const external = "external" in link && link.external;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="text-sm text-lilac/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-lilac/50">
            © {new Date().getFullYear()} Pleasure Coin. All rights reserved.
          </p>
          <p className="text-xs text-lilac/50 font-mono">
            Built on Polygon · Powered by $NSFW
          </p>
        </div>
      </div>
    </footer>
  );
}
