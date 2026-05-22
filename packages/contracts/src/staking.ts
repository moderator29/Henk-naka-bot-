/**
 * Staking contract — PENDING_CONTRACT_ADDRESS (RPD §13).
 *
 * Address and ABI arrive from Tim & Paul. Until then this package exports the
 * typed surface only. The app reads NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS and
 * threads it into the contract client; this package stays runtime-agnostic.
 */

import type { Address } from "viem";

export const STAKING_LOCK_WEEKS = 12 as const;

export const PENDING_STAKING_ADDRESS = "PENDING_CONTRACT_ADDRESS" as const;

export type StakingAddress = Address | typeof PENDING_STAKING_ADDRESS;

export function isStakingDeployed(
  address: StakingAddress
): address is Address {
  return address !== PENDING_STAKING_ADDRESS;
}

/**
 * Typed surface area. When the real ABI arrives, this becomes an
 * `as const satisfies Abi` export and viem types align automatically.
 */
export interface StakingPosition {
  amountStaked: bigint;
  stakedAt: bigint;
  unlockAt: bigint;
  pendingRewards: bigint;
}

export interface StakingContractSurface {
  positionOf(account: Address): Promise<StakingPosition>;
  totalStaked(): Promise<bigint>;
  apyBps(): Promise<number>;
  stake(amount: bigint): Promise<`0x${string}`>;
  requestUnlock(): Promise<`0x${string}`>;
  withdraw(): Promise<`0x${string}`>;
  claimRewards(): Promise<`0x${string}`>;
}

export class StakingNotDeployedError extends Error {
  constructor() {
    super(
      "Staking contract is not yet deployed. Set NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS once Tim & Paul provide it."
    );
    this.name = "StakingNotDeployedError";
  }
}
