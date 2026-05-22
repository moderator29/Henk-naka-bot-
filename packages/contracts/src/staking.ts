/**
 * Staking contract — PENDING_CONTRACT_ADDRESS (RPD §13).
 *
 * The address and ABI arrive from Tim & Paul. Until then, the typed interface
 * below matches the expected shape so the UI binds against real types and
 * swapping in the real ABI is a one-line replacement.
 *
 * No code path here generates a fake transaction. Reads against this address
 * will throw; writes will throw. The UI must check `isStakingDeployed()` and
 * render the "coming soon" surface when false.
 */

import type { Address } from "viem";

const ENV_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS;

export const STAKING_CONTRACT_ADDRESS = (ENV_ADDRESS && ENV_ADDRESS.length > 0
  ? (ENV_ADDRESS as Address)
  : "PENDING_CONTRACT_ADDRESS") as Address | "PENDING_CONTRACT_ADDRESS";

export function isStakingDeployed(): boolean {
  return STAKING_CONTRACT_ADDRESS !== "PENDING_CONTRACT_ADDRESS";
}

/**
 * Typed surface area. When the real ABI arrives, replace this with the actual
 * `as const satisfies Abi` export and the rest of the app keeps compiling.
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
      "Staking contract address is PENDING_CONTRACT_ADDRESS. Set NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS once Tim & Paul provide it."
    );
    this.name = "StakingNotDeployedError";
  }
}

export const STAKING_LOCK_WEEKS = 12 as const;
