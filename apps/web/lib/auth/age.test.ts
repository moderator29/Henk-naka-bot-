import { describe, it, expect } from "vitest";
import {
  calculateAge,
  isAdult,
  parseDateOfBirth,
  maxDateOfBirthInput,
  MIN_AGE,
} from "./age";

describe("calculateAge", () => {
  it("computes whole years, accounting for birthday not yet reached", () => {
    const now = new Date(Date.UTC(2026, 4, 22)); // 2026-05-22
    expect(calculateAge(new Date(Date.UTC(2000, 4, 22)), now)).toBe(26);
    // birthday tomorrow → still 25
    expect(calculateAge(new Date(Date.UTC(2000, 4, 23)), now)).toBe(25);
    // birthday yesterday → 26
    expect(calculateAge(new Date(Date.UTC(2000, 4, 21)), now)).toBe(26);
  });
});

describe("isAdult", () => {
  const now = new Date(Date.UTC(2026, 4, 22));
  it("is true for exactly 18 today", () => {
    expect(isAdult(new Date(Date.UTC(2008, 4, 22)), now)).toBe(true);
  });
  it("is false one day short of 18", () => {
    expect(isAdult(new Date(Date.UTC(2008, 4, 23)), now)).toBe(false);
  });
  it("is false for a clearly underage dob", () => {
    expect(isAdult(new Date(Date.UTC(2015, 0, 1)), now)).toBe(false);
  });
});

describe("parseDateOfBirth", () => {
  it("parses a valid YYYY-MM-DD", () => {
    const d = parseDateOfBirth("2000-02-29");
    expect(d?.getUTCFullYear()).toBe(2000);
    expect(d?.getUTCMonth()).toBe(1);
    expect(d?.getUTCDate()).toBe(29);
  });
  it("rejects malformed strings", () => {
    expect(parseDateOfBirth("not-a-date")).toBeNull();
    expect(parseDateOfBirth("2000-13-01")).toBeNull();
    expect(parseDateOfBirth("2001-02-29")).toBeNull(); // not a leap year
    expect(parseDateOfBirth("")).toBeNull();
  });
});

describe("maxDateOfBirthInput", () => {
  it("returns the date exactly MIN_AGE years before now", () => {
    const now = new Date(Date.UTC(2026, 4, 22));
    expect(maxDateOfBirthInput(now)).toBe(`${2026 - MIN_AGE}-05-22`);
  });
});
