"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { NSFW_TOKEN_ABI, NSFW_DECIMALS } from "@aurora/contracts";
import { NSFW_TOKEN_ADDRESS } from "./addresses";

/**
 * Reads the connected wallet's $NSFW balance from the live token contract on
 * Polygon. Real on-chain read via wagmi/viem — no mock. Returns formatted and
 * raw values plus loading/connection state.
 */
export function useNsfwBalance() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch, error } = useReadContract({
    address: NSFW_TOKEN_ADDRESS,
    abi: NSFW_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      staleTime: 15_000,
    },
  });

  const raw = (data as bigint | undefined) ?? 0n;
  const formatted = formatUnits(raw, NSFW_DECIMALS);

  return {
    isConnected,
    address,
    raw,
    formatted,
    isLoading,
    error,
    refetch,
  };
}
