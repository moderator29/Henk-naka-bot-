import { describe, it, expect } from "vitest";
import { scorePassword } from "./PasswordStrength";

describe("scorePassword", () => {
  it("scores empty and weak passwords low", () => {
    expect(scorePassword("")).toBe(0);
    expect(scorePassword("abc")).toBeLessThanOrEqual(1);
  });

  it("rewards length, mixed case, numbers, and symbols", () => {
    expect(scorePassword("GoodPass1")).toBeGreaterThanOrEqual(3);
    expect(scorePassword("Str0ng!Passw0rd")).toBe(4);
  });

  it("never exceeds 4", () => {
    expect(scorePassword("aA1!aA1!aA1!aA1!")).toBeLessThanOrEqual(4);
  });
});
