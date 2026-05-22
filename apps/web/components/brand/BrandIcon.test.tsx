import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandIcon, type BrandIconName } from "./BrandIcon";

describe("BrandIcon", () => {
  const names: BrandIconName[] = [
    "rocket",
    "heart",
    "diamond",
    "lock",
    "globe",
    "sparkle",
    "crown",
  ];

  it.each(names)("renders the %s icon with an accessible label", (name) => {
    render(<BrandIcon name={name} />);
    expect(screen.getByLabelText(`${name} icon`)).toBeInTheDocument();
  });

  it("renders the placeholder glyph until a real render is registered", () => {
    // brand-icon-manifest currently has every entry false, so the SVG glyph
    // path is exercised.
    render(<BrandIcon name="rocket" size={48} />);
    const wrapper = screen.getByTestId("brand-icon-rocket");
    expect(wrapper.querySelector("svg")).toBeTruthy();
  });
});
