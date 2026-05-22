import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with a label tied to the input via htmlFor", () => {
    render(<Input label="Email" placeholder="you@example.com" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "you@example.com");
  });

  it("surfaces an error message via role=alert and aria-invalid", () => {
    render(<Input label="Email" error="Required" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("renders a hint when no error is present", () => {
    render(<Input label="Username" hint="3-20 characters" />);
    expect(screen.getByText("3-20 characters")).toBeInTheDocument();
  });
});
