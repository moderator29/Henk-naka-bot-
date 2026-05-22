import { erc20Abi, type Address } from "viem";

/**
 * $NSFW token on Polygon. Standard ERC-20 ABI; no custom extensions surfaced
 * from the deployed contract beyond what we need.
 */
export const NSFW_TOKEN_ADDRESS =
  "0x8f006d1e1d9dc6c98996f50a4c810f17a47fbf19" as const satisfies Address;

export const NSFW_TOKEN_ABI = erc20Abi;

export const NSFW_DECIMALS = 18 as const;
export const NSFW_SYMBOL = "NSFW" as const;
