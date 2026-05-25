/**
 * Shared subscription types. Kept in a plain module (not the "use server"
 * actions file, which may only export async functions).
 */

export interface SubscribeTarget {
  tierId: string;
  tierName: string;
  benefits: string[];
  creatorUserId: string;
  creatorUsername: string;
  creatorName: string;
  /** Where the $NSFW payment is sent. Null when the creator has no wallet. */
  payoutWallet: string | null;
  /** USD list price, when the creator set one. */
  priceUsd: number | null;
  /** Token amount fallback, charged when a live USD price is unavailable. */
  priceNsfw: number;
}

export interface MySubscription {
  id: string;
  tierId: string;
  tierName: string;
  creatorUsername: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  /** expires_at is still in the future. */
  active: boolean;
}

export const SUBSCRIPTION_PERIOD_DAYS = 30;
