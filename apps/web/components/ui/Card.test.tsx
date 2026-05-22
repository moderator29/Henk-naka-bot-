import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";

describe("Card", () => {
  it("composes header, title, description, content, and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Subscribe</CardTitle>
          <CardDescription>Access this tier</CardDescription>
        </CardHeader>
        <CardContent>Monthly access</CardContent>
        <CardFooter>buttons</CardFooter>
      </Card>
    );

    expect(screen.getByRole("heading", { name: "Subscribe" })).toBeInTheDocument();
    expect(screen.getByText("Access this tier")).toBeInTheDocument();
    expect(screen.getByText("Monthly access")).toBeInTheDocument();
    expect(screen.getByText("buttons")).toBeInTheDocument();
  });
});
