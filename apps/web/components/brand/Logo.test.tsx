import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the home link by default", () => {
    render(<Logo />);
    expect(screen.getByLabelText("Pleasure Coin home")).toBeInTheDocument();
  });

  it("hides the wordmark when showWordmark is false", () => {
    render(<Logo showWordmark={false} />);
    expect(screen.queryByText(/Pleasure/)).toBeNull();
  });

  it("renders without a link when href is null", () => {
    render(<Logo href={null} />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
