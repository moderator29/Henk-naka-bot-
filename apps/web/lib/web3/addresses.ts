/**
 * Contract addresses for the running app. Resolves env vars into typed values,
 * keeping the contracts package itself runtime-agnostic.
 */

import {
  NSFW_TOKEN_ADDRESS as DEFAULT_NSFW_TOKEN_ADDRESS,
  PENDING_STAKING_ADDRESS,
  parseAddressList,
  type StakingAddress,
} from "@aurora/contracts";
import type { Address } from "viem";

function isAddress(value: string | undefined): value is Address {
  return !!value && value.startsWith("0x") && value.length === 42;
}

const rawToken = process.env.NEXT_PUBLIC_NSFW_TOKEN_ADDRESS;

/** The deployed $NSFW address, overridable by env, defaulting to the contract. */
export const NSFW_TOKEN_ADDRESS: Address = isAddress(rawToken)
  ? rawToken
  : DEFAULT_NSFW_TOKEN_ADDRESS;

const rawStaking = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS;

export const STAKING_CONTRACT_ADDRESS: StakingAddress = isAddress(rawStaking)
  ? rawStaking
  : PENDING_STAKING_ADDRESS;

export const NFT_CONTRACT_ADDRESSES: Address[] = parseAddressList(
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES
);

export const isMarketplaceWired = NFT_CONTRACT_ADDRESSES.length > 0;
