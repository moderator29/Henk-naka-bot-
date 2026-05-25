import { describe, it, expect } from "vitest";
import { atLeast, type Role } from "./roles";

describe("role access control (atLeast)", () => {
  const order: Role[] = ["user", "creator", "moderator", "admin", "superadmin"];

  it("a role always meets its own threshold", () => {
    for (const r of order) expect(atLeast(r, r)).toBe(true);
  });

  it("higher roles satisfy lower thresholds", () => {
    expect(atLeast("admin", "moderator")).toBe(true);
    expect(atLeast("superadmin", "admin")).toBe(true);
    expect(atLeast("moderator", "creator")).toBe(true);
  });

  it("lower roles do NOT satisfy higher thresholds", () => {
    expect(atLeast("user", "moderator")).toBe(false);
    expect(atLeast("creator", "moderator")).toBe(false);
    expect(atLeast("moderator", "admin")).toBe(false);
    expect(atLeast("admin", "superadmin")).toBe(false);
  });

  it("a plain user can never reach admin", () => {
    expect(atLeast("user", "admin")).toBe(false);
    expect(atLeast("user", "superadmin")).toBe(false);
  });
});
