import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygon, polygonAmoy } from "wagmi/chains";
import { http } from "wagmi";

/**
 * wagmi + RainbowKit config (RPD §5.5).
 *
 * Polygon mainnet is the active chain; Amoy testnet is available for staging.
 * Alchemy provides the RPC transport when a key is present, otherwise wagmi
 * falls back to the chain's public RPC so local dev still functions.
 *
 * The WalletConnect project id is required in production. In dev we allow a
 * placeholder so the app boots without it — the connect modal's WalletConnect
 * option simply won't initialise until a real id is set.
 */

// WalletConnect needs a project id to enable its connector. We never throw at
// module load (that would break `next build` and SSR) — instead we fall back
// to a placeholder so the app boots, and the WalletConnect option stays inert
// until a real id is provided. Injected connectors (MetaMask, Coinbase) work
// regardless. PENDING_WC_PROJECT_ID for live WalletConnect support.
const wcProjectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "AURORA_DEV_PLACEHOLDER";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

export const wagmiConfig = getDefaultConfig({
  appName: "Pleasure Coin",
  projectId: wcProjectId,
  chains: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: http(
      alchemyKey
        ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`
        : undefined
    ),
    [polygonAmoy.id]: http(
      alchemyKey
        ? `https://polygon-amoy.g.alchemy.com/v2/${alchemyKey}`
        : undefined
    ),
  },
  ssr: true,
});

export const ACTIVE_CHAIN = polygon;
