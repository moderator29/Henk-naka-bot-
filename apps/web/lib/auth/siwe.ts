import { createSiweMessage } from "viem/siwe";
import type { Address } from "viem";

/**
 * SIWE (Sign-In With Ethereum) helpers, RPD §5.4 / §9.3.
 *
 * Flow:
 *   1. Browser GET /api/auth/nonce, server mints a random nonce, sets it in
 *      an httpOnly cookie, returns it.
 *   2. Browser builds a SIWE message with that nonce and has the wallet sign
 *      it (client side, via wagmi, wired in sub-branch #9).
 *   3. Browser POST /api/auth/verify with { message, signature }. Server
 *      verifies the signature, checks the nonce matches the cookie (single
 *      use), then mints a Supabase session for the wallet address.
 *
 * The nonce living in an httpOnly cookie gives replay protection without a
 * Redis round-trip; it is single-use (cleared on verify) and short-lived.
 */

export const SIWE_NONCE_COOKIE = "aurora-siwe-nonce";
export const SIWE_STATEMENT =
  "Sign in to Pleasure Coin. This signature proves you control this wallet. It costs no gas and does not authorize any transaction.";

/** 17-char alphanumeric nonce per the SIWE spec minimum. */
export function generateNonce(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

interface BuildMessageArgs {
  address: Address;
  chainId: number;
  domain: string;
  uri: string;
  nonce: string;
}

export function buildSiweMessage({
  address,
  chainId,
  domain,
  uri,
  nonce,
}: BuildMessageArgs): string {
  return createSiweMessage({
    address,
    chainId,
    domain,
    uri,
    nonce,
    statement: SIWE_STATEMENT,
    version: "1",
    issuedAt: new Date(),
  });
}
