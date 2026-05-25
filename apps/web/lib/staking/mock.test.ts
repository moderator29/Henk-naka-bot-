import { describe, it, expect } from "vitest";
import {
  STAKING_APY,
  STAKING_LOCK_WEEKS,
  projectedRewards,
  accruedRewards,
  lockUnlockFrom,
  projectionSeries,
  type StakePosition,
} from "./mock";

describe("staking math", () => {
  it("APY is 10% over a 12-week lock", () => {
    expect(STAKING_APY).toBeCloseTo(0.1);
    expect(STAKING_LOCK_WEEKS).toBe(12);
  });

  it("projectedRewards scales linearly with the APY and weeks", () => {
    // 10% APY over a full year on 1000 = 100.
    expect(projectedRewards(1000, 52)).toBeCloseTo(100, 5);
    // Over the 12-week lock.
    expect(projectedRewards(1000)).toBeCloseTo(1000 * 0.1 * (12 / 52), 5);
    expect(projectedRewards(0)).toBe(0);
  });

  it("accrued rewards are zero at stake time and grow, capped at the lock term", () => {
    const now = Date.now();
    const fresh: StakePosition = {
      id: "a",
      amount: 1000,
      stakedAt: now,
      unlockAt: lockUnlockFrom(now),
    };
    expect(accruedRewards(fresh, now)).toBeCloseTo(0, 5);

    const sixWeeksAgo = now - 6 * 7 * 24 * 60 * 60 * 1000;
    const half: StakePosition = {
      id: "b",
      amount: 1000,
      stakedAt: sixWeeksAgo,
      unlockAt: lockUnlockFrom(sixWeeksAgo),
    };
    expect(accruedRewards(half, now)).toBeCloseTo(projectedRewards(1000, 6), 4);

    const longAgo = now - 52 * 7 * 24 * 60 * 60 * 1000;
    const capped: StakePosition = {
      id: "c",
      amount: 1000,
      stakedAt: longAgo,
      unlockAt: lockUnlockFrom(longAgo),
    };
    // Capped at the 12-week term.
    expect(accruedRewards(capped, now)).toBeCloseTo(projectedRewards(1000, 12), 4);
  });

  it("lockUnlockFrom is 12 weeks out", () => {
    const start = Date.now();
    const weeks = (lockUnlockFrom(start) - start) / (7 * 24 * 60 * 60 * 1000);
    expect(weeks).toBeCloseTo(12, 5);
  });

  it("projectionSeries spans the lock and increases", () => {
    const s = projectionSeries(1000);
    expect(s).toHaveLength(STAKING_LOCK_WEEKS + 1);
    const first = s[0]!;
    const last = s[s.length - 1]!;
    expect(first.value).toBe(1000);
    expect(last.value).toBeGreaterThan(first.value);
  });
});
