/**
 * NFT collection contracts — PENDING_CONTRACT_ADDRESS (RPD §13).
 *
 * Tim & Paul will provide one or more collection addresses + ABIs. Until then,
 * the surface below is the typed interface the marketplace UI codes against.
 */

import type { Address } from "viem";

const ENV_ADDRESSES = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES;

export const NFT_CONTRACT_ADDRESSES: Address[] =
  ENV_ADDRESSES && ENV_ADDRESSES.length > 0
    ? (ENV_ADDRESSES.split(",")
        .map((s) => s.trim())
        .filter((s) => s.startsWith("0x")) as Address[])
    : [];

export function isMarketplaceWired(): boolean {
  return NFT_CONTRACT_ADDRESSES.length > 0;
}

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

export interface NftListingSurface {
  ownerOf(tokenId: string): Promise<Address>;
  tokenURI(tokenId: string): Promise<string>;
  transferFrom(from: Address, to: Address, tokenId: bigint): Promise<`0x${string}`>;
}

export class MarketplaceNotWiredError extends Error {
  constructor() {
    super(
      "No NFT contract addresses configured. Set NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES once contracts are provided."
    );
    this.name = "MarketplaceNotWiredError";
  }
}
