"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LineChart, Wallet } from "lucide-react";

/**
 * Gates the live $NSFW chart behind an in-app wallet connection. Until the
 * visitor connects the same wallet they use across the platform, a clean
 * prompt stands in for the chart and opens the RainbowKit connect modal. Once
 * connected, the chart renders. SSR-safe: renders the prompt until mounted so
 * wagmi's connection state is known, avoiding a hydration mismatch.
 */
export function ChartWalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && isConnected) return <>{children}</>;

  return (
    <div className="glass-strong edge-light rounded-3xl px-6 py-14 sm:py-20 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
        <LineChart size={24} className="text-white" aria-hidden="true" />
      </div>
      <h3 className="font-display text-2xl font-bold text-white">
        Connect your wallet to view the live chart
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-lilac/70">
        The $NSFW price chart and trading data unlock once you connect your
        wallet, the same one you use for tips, subscriptions, and the
        marketplace across Pleasure Coin.
      </p>
      <div className="mt-7 flex justify-center">
        <ConnectButton.Custom>
          {({ openConnectModal, mounted: rkMounted }) => (
            <button
              type="button"
              onClick={openConnectModal}
              disabled={!rkMounted}
              className="btn-primary text-white font-semibold h-11 px-6 rounded-xl text-sm shadow-glow hover:shadow-glow-lg transition-shadow inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Wallet size={16} aria-hidden="true" />
              Connect wallet
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}
