/**
 * Subscription presentation constants. $20 is the standard monthly price we
 * surface as the headline; the on-chain charge is the creator's tier price in
 * $NSFW, shown alongside with a live USD estimate. Subscribing grants the
 * subscriber badge and unlocks the creator's gated posts and Pveels everywhere
 * (enforced by the entitlement engine, lib/entitlement.ts).
 */

export const STANDARD_SUB_USD = 20;
export const SUB_PERIOD_DAYS = 30;

export const SUBSCRIBER_BENEFITS: string[] = [
  "All subscribers-only posts and Pveels",
  "The Subscriber badge on your profile and name",
  "Direct messages with the creator",
  "Tip and request content",
  "Early access to new posts and Pveels",
  "Exclusive, behind-the-scenes content",
  "Ad-free, premium experience",
  "Premium AI features (full Concierge personalization)",
];
