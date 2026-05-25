import { describe, it, expect } from "vitest";
import { isEntitled, type ViewerAccess } from "./entitlement";

function access(partial: Partial<ViewerAccess> = {}): ViewerAccess {
  return {
    viewerId: "viewer",
    follows: new Set(),
    subCreators: new Set(),
    subTiers: new Set(),
    ...partial,
  };
}

describe("isEntitled", () => {
  it("public content is open to everyone, even signed-out", () => {
    const a = access({ viewerId: null });
    expect(isEntitled(a, { creatorId: "c", visibility: "public", tierRequired: null })).toBe(true);
  });

  it("the author always sees their own gated content", () => {
    const a = access({ viewerId: "c" });
    expect(isEntitled(a, { creatorId: "c", visibility: "subscribers", tierRequired: null })).toBe(true);
  });

  it("signed-out viewers never see gated content", () => {
    const a = access({ viewerId: null });
    expect(isEntitled(a, { creatorId: "c", visibility: "subscribers", tierRequired: null })).toBe(false);
  });

  it("followers-only needs a follow (or a subscription)", () => {
    expect(
      isEntitled(access({ follows: new Set(["c"]) }), { creatorId: "c", visibility: "followers", tierRequired: null })
    ).toBe(true);
    expect(
      isEntitled(access(), { creatorId: "c", visibility: "followers", tierRequired: null })
    ).toBe(false);
  });

  it("subscribers-only needs an active subscription to the creator", () => {
    expect(
      isEntitled(access({ subCreators: new Set(["c"]) }), { creatorId: "c", visibility: "subscribers", tierRequired: null })
    ).toBe(true);
    expect(
      isEntitled(access({ follows: new Set(["c"]) }), { creatorId: "c", visibility: "subscribers", tierRequired: null })
    ).toBe(false);
  });

  it("tier-gated needs an active subscription to that specific tier", () => {
    expect(
      isEntitled(access({ subTiers: new Set(["t1"]) }), { creatorId: "c", visibility: "tier", tierRequired: "t1" })
    ).toBe(true);
    expect(
      isEntitled(access({ subTiers: new Set(["t2"]) }), { creatorId: "c", visibility: "tier", tierRequired: "t1" })
    ).toBe(false);
  });
});
