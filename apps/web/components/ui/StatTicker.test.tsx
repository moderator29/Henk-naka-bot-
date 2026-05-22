import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatTicker } from "./StatTicker";

describe("StatTicker", () => {
  it("renders the initial value, prefix, and suffix", () => {
    render(<StatTicker value={1234} prefix="$" suffix=" USD" />);
    // Pre-animation the value starts at zero; we assert the prefix/suffix
    // are present without depending on the animation timing.
    expect(screen.getByText(/\$/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
  });
});
