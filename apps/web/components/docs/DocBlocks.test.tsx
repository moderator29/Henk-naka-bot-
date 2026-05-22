import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocBlocks, slugify } from "./DocBlocks";
import type { DocBlock } from "@/app/(docs)/docs/content";

describe("slugify", () => {
  it("strips punctuation and lowercases", () => {
    expect(slugify("How Staking Works!")).toBe("how-staking-works");
    expect(slugify("Auto-renew")).toBe("auto-renew");
  });
});

describe("DocBlocks", () => {
  it("renders headings, paragraphs, lists, and callouts", () => {
    const blocks: DocBlock[] = [
      { type: "h2", text: "Setup" },
      { type: "p", text: "Connect your wallet to begin." },
      { type: "ul", items: ["MetaMask", "WalletConnect", "Coinbase Wallet"] },
      { type: "callout", tone: "warning", text: "Never share your seed phrase." },
    ];
    render(<DocBlocks blocks={blocks} />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Setup/ })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Connect your wallet to begin.")
    ).toBeInTheDocument();
    expect(screen.getByText("MetaMask")).toBeInTheDocument();
    expect(
      screen.getByText("Never share your seed phrase.")
    ).toBeInTheDocument();
  });

  it("emits scroll-friendly anchor ids on h2 and h3", () => {
    const { container } = render(
      <DocBlocks
        blocks={[
          { type: "h2", text: "Best posting times" },
          { type: "h3", text: "Audience timezones" },
        ]}
      />
    );
    expect(container.querySelector("#best-posting-times")).toBeTruthy();
    expect(container.querySelector("#audience-timezones")).toBeTruthy();
  });
});
