import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GradientText } from "./GradientText";

describe("GradientText", () => {
  it("renders children with the gradient class", () => {
    render(<GradientText>creator</GradientText>);
    const el = screen.getByText("creator");
    expect(el.className).toMatch(/text-gradient/);
  });

  it("applies the shift animation when animate is true", () => {
    render(<GradientText animate>aurora</GradientText>);
    expect(screen.getByText("aurora").className).toMatch(/animate-gradient-shift/);
  });

  it("supports rendering as a heading", () => {
    render(<GradientText as="h2">Big</GradientText>);
    expect(screen.getByRole("heading", { name: "Big", level: 2 })).toBeInTheDocument();
  });
});
