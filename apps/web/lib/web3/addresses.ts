/**
 * Contract addresses for the running app. Resolves env vars into typed values,
 * keeping the contracts package itself runtime-agnostic.
 */

import {
  NSFW_TOKEN_ADDRESS,
  PENDING_STAKING_ADDRESS,
  parseAddressList,
  type StakingAddress,
} from "@aurora/contracts";
import type { Address } from "viem";

export { NSFW_TOKEN_ADDRESS };

const rawStaking = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS;

export const STAKING_CONTRACT_ADDRESS: StakingAddress =
  rawStaking && rawStaking.startsWith("0x") && rawStaking.length === 42
    ? (rawStaking as Address)
    : PENDING_STAKING_ADDRESS;

export const NFT_CONTRACT_ADDRESSES: Address[] = parseAddressList(
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES
);

export const isMarketplaceWired = NFT_CONTRACT_ADDRESSES.length > 0;
