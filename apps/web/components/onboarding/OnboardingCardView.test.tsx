import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingCardView } from "./OnboardingCardView";
import { ONBOARDING_CARDS } from "./cards";

describe("OnboardingCardView", () => {
  it.each(ONBOARDING_CARDS)("renders the %s card content", (card) => {
    render(<OnboardingCardView card={card} />);
    expect(screen.getByText(card.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(card.body)).toBeInTheDocument();
    expect(screen.getByTestId(`onboarding-card-${card.id}`)).toBeInTheDocument();
  });
});
