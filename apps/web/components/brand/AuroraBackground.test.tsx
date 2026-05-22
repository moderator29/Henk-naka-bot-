import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuroraBackground } from "./AuroraBackground";

describe("AuroraBackground", () => {
  it("renders the decorative container", () => {
    render(<AuroraBackground />);
    const bg = screen.getByTestId("aurora-background");
    expect(bg).toBeInTheDocument();
    expect(bg).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts all variants without throwing", () => {
    for (const variant of ["magenta", "purple", "cyan", "orchid"] as const) {
      const { unmount } = render(<AuroraBackground variant={variant} />);
      expect(screen.getByTestId("aurora-background")).toBeInTheDocument();
      unmount();
    }
  });
});
