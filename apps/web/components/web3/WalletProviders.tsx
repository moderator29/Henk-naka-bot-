"use client";

import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/web3/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

/**
 * Wallet stack (wagmi + RainbowKit). Scoped to the routes that actually use a
 * wallet (the platform, auth sign-in, and trade) so the heavy wallet bundle
 * (wagmi + RainbowKit + viem + WalletConnect) never ships on the marketing
 * pages or docs. Relies on the QueryClientProvider from the root providers.
 */
export function WalletProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#FF1F8F",
          accentColorForeground: "#FFFFFF",
          borderRadius: "large",
          fontStack: "system",
          overlayBlur: "large",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
