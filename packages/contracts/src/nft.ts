/**
 * NFT collection contracts — PENDING_CONTRACT_ADDRESS (RPD §13).
 *
 * The app reads NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES and threads the parsed list
 * into surfaces that consume this type. This package stays runtime-agnostic.
 */

import type { Address } from "viem";

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

export interface NftListingSurface {
  ownerOf(tokenId: string): Promise<Address>;
  tokenURI(tokenId: string): Promise<string>;
  transferFrom(
    from: Address,
    to: Address,
    tokenId: bigint
  ): Promise<`0x${string}`>;
}

export class MarketplaceNotWiredError extends Error {
  constructor() {
    super(
      "No NFT contract addresses configured. Set NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES once contracts are provided."
    );
    this.name = "MarketplaceNotWiredError";
  }
}

export function parseAddressList(raw: string | undefined): Address[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string): s is Address => s.startsWith("0x") && s.length === 42);
}
