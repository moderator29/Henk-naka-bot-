import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("exposes a polite live region for assistive tech", () => {
    render(<Skeleton className="h-4 w-32" />);
    const sk = screen.getByRole("status");
    expect(sk).toHaveAttribute("aria-busy", "true");
    expect(sk).toHaveAttribute("aria-live", "polite");
  });
});
