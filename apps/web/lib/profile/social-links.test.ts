import { describe, it, expect } from "vitest";
import { normalizeTelegram, normalizeX } from "./social-links";

describe("normalizeTelegram", () => {
  it("clears on empty input", () => {
    expect(normalizeTelegram("  ")).toEqual({ url: null });
  });
  it("accepts a bare handle", () => {
    expect(normalizeTelegram("aurora_user")).toEqual({
      url: "https://t.me/aurora_user",
    });
  });
  it("accepts an @handle", () => {
    expect(normalizeTelegram("@aurora_user").url).toBe("https://t.me/aurora_user");
  });
  it("accepts a t.me URL", () => {
    expect(normalizeTelegram("https://t.me/aurora_user").url).toBe(
      "https://t.me/aurora_user"
    );
  });
  it("rejects a too-short handle", () => {
    expect(normalizeTelegram("ab").error).toBeTruthy();
  });
  it("rejects illegal characters", () => {
    expect(normalizeTelegram("bad handle!").error).toBeTruthy();
  });
});

describe("normalizeX", () => {
  it("clears on empty input", () => {
    expect(normalizeX("")).toEqual({ url: null });
  });
  it("accepts a bare handle", () => {
    expect(normalizeX("nova").url).toBe("https://x.com/nova");
  });
  it("accepts a twitter.com URL and canonicalizes to x.com", () => {
    expect(normalizeX("https://twitter.com/nova").url).toBe("https://x.com/nova");
  });
  it("rejects handles longer than 15 chars", () => {
    expect(normalizeX("a".repeat(16)).error).toBeTruthy();
  });
});
