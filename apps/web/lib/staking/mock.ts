/**
 * Staking mock adapter — PENDING_CONTRACT_ADDRESS.
 *
 * The staking contract address is not wired yet (Tim & Paul), so the staking
 * UI runs against this typed mock. Every figure here is illustrative preview
 * data, never presented to the user as real on-chain state: the dashboard shows
 * a clear "Preview" marker while STAKING_IS_MOCK is true. When the real address
 * lands, swap these reads/writes for the wagmi contract calls in
 * packages/contracts and flip STAKING_IS_MOCK off.
 */

export const STAKING_APY_BPS = 1000; // 10.00%
export const STAKING_APY = STAKING_APY_BPS / 10_000;
export const STAKING_LOCK_WEEKS = 12;
export const STAKING_IS_MOCK = true;

/** Illustrative pool total (preview only, not an on-chain read). */
export const MOCK_TOTAL_STAKED = 4_820_000;

export interface StakePosition {
  id: string;
  amount: number;
  stakedAt: number; // epoch ms
  unlockAt: number; // epoch ms
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function lockUnlockFrom(start = Date.now()): number {
  return start + STAKING_LOCK_WEEKS * WEEK_MS;
}

/** Linear projected rewards for an amount over a number of weeks at the APY. */
export function projectedRewards(
  amount: number,
  weeks = STAKING_LOCK_WEEKS
): number {
  return amount * STAKING_APY * (weeks / 52);
}

/** Rewards accrued so far for a position (linear, capped at the lock term). */
export function accruedRewards(p: StakePosition, now = Date.now()): number {
  const elapsedWeeks = Math.min(
    STAKING_LOCK_WEEKS,
    Math.max(0, (now - p.stakedAt) / WEEK_MS)
  );
  return projectedRewards(p.amount, elapsedWeeks);
}

export interface ProjectionPoint {
  week: number;
  value: number;
}

/** Principal + linear rewards across the lock term, for the APY chart. */
export function projectionSeries(amount: number): ProjectionPoint[] {
  const base = amount > 0 ? amount : 1000;
  return Array.from({ length: STAKING_LOCK_WEEKS + 1 }, (_, week) => ({
    week,
    value: Math.round(base + projectedRewards(base, week)),
  }));
}
