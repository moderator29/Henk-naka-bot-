import type { Address } from "viem";
import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";

/**
 * Trade configuration for the $NSFW terminal. The pair is NSFW vs native USDC
 * on Polygon. Swaps route through the 0x Swap API; the platform fee is taken via
 * 0x's affiliate-fee mechanism to the treasury wallet (no custom contract).
 */

export const POLYGON_CHAIN_ID = 137;

export const NSFW = {
  address: NSFW_TOKEN_ADDRESS as Address,
  symbol: "NSFW",
  decimals: 18,
} as const;

// Native USDC on Polygon PoS.
export const USDC = {
  address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" as Address,
  symbol: "USDC",
  decimals: 6,
} as const;

/** Swap fee in basis points sent to the treasury via the 0x affiliate fee. */
export function swapFeeBps(): number {
  const n = Number(process.env.NEXT_PUBLIC_SWAP_FEE_BPS);
  return Number.isFinite(n) && n >= 0 && n <= 1000 ? n : 100; // default 1%
}

/** Treasury wallet (Polygon) that receives swap fees. Null until configured. */
export function treasuryWallet(): Address | null {
  const w = process.env.NEXT_PUBLIC_TREASURY_WALLET;
  return w && /^0x[0-9a-fA-F]{40}$/.test(w) ? (w as Address) : null;
}
