import { describe, it, expect } from "vitest";
import {
  validateFile,
  IMAGE_MAX_BYTES,
  VIDEO_MAX_BYTES,
} from "./upload";

const mb = (n: number) => n * 1024 * 1024;

describe("validateFile", () => {
  it("accepts allowed images under the cap", () => {
    expect(validateFile({ type: "image/jpeg", size: mb(2) }).ok).toBe(true);
    expect(validateFile({ type: "image/webp", size: mb(1) }).kind).toBe("image");
  });

  it("rejects images over 3 MB", () => {
    const r = validateFile({ type: "image/png", size: IMAGE_MAX_BYTES + 1 });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/3 MB/);
  });

  it("accepts allowed videos under the cap", () => {
    expect(validateFile({ type: "video/mp4", size: mb(8) }).ok).toBe(true);
    expect(validateFile({ type: "video/quicktime", size: mb(5) }).kind).toBe("video");
  });

  it("rejects videos over 10 MB", () => {
    const r = validateFile({ type: "video/webm", size: VIDEO_MAX_BYTES + 1 });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/10 MB/);
  });

  it("rejects disallowed types", () => {
    expect(validateFile({ type: "application/pdf", size: 1000 }).ok).toBe(false);
    expect(validateFile({ type: "image/svg+xml", size: 1000 }).ok).toBe(false);
  });

  it("honours the allow list (video-only context rejects images)", () => {
    const r = validateFile({ type: "image/jpeg", size: mb(1) }, { allow: ["video"] });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Videos must be/);
  });
});
