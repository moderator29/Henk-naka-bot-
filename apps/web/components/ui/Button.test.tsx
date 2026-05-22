import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("defaults to type=button when not asChild", () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("renders loading state with spinner and disables the button", () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole("button", { name: /Saving/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("supports all variant + size combinations without throwing", () => {
    const variants = ["primary", "secondary", "ghost", "glass", "danger"] as const;
    const sizes = ["sm", "md", "lg", "icon"] as const;
    for (const variant of variants) {
      for (const size of sizes) {
        const { unmount } = render(
          <Button variant={variant} size={size}>
            {variant}-{size}
          </Button>
        );
        expect(screen.getByRole("button")).toBeInTheDocument();
        unmount();
      }
    }
  });
});
