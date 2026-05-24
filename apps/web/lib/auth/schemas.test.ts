import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema, passwordSchema } from "./schemas";
import { maxDateOfBirthInput } from "./age";

describe("passwordSchema", () => {
  it("requires 8+ chars with upper, lower, and a number", () => {
    expect(passwordSchema.safeParse("short1A").success).toBe(false);
    expect(passwordSchema.safeParse("alllowercase1").success).toBe(false);
    expect(passwordSchema.safeParse("ALLUPPERCASE1").success).toBe(false);
    expect(passwordSchema.safeParse("NoNumbersHere").success).toBe(false);
    expect(passwordSchema.safeParse("GoodPass1").success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("accepts a valid email + non-empty password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
  });
  it("rejects a bad email", () => {
    expect(
      signInSchema.safeParse({ email: "nope", password: "x" }).success
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  const adultDob = maxDateOfBirthInput(); // exactly 18 today
  const base = {
    firstName: "Ada",
    lastName: "Lovelace",
    username: "ada_l",
    displayName: "Ada",
    email: "fan@example.com",
    password: "GoodPass1",
    confirmPassword: "GoodPass1",
    dateOfBirth: adultDob,
    ageConfirmed: true as const,
  };

  it("accepts a complete, adult, confirmed signup", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      ...base,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid username", () => {
    const result = signUpSchema.safeParse({ ...base, username: "no" });
    expect(result.success).toBe(false);
  });

  it("rejects an underage dob", () => {
    const result = signUpSchema.safeParse({
      ...base,
      email: "kid@example.com",
      dateOfBirth: "2015-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("requires the age confirmation checkbox", () => {
    const result = signUpSchema.safeParse({ ...base, ageConfirmed: false });
    expect(result.success).toBe(false);
  });
});
