"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

/**
 * Brand-styled wallet connect entry point. Wraps RainbowKit's ConnectButton
 * with a custom render so it matches the Aurora button language, and surfaces
 * a wrong-network prompt (auto-switch to Polygon) per RPD §5.5.
 */
export function ConnectWallet({ compact = false }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return compact ? (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    aria-label="Connect wallet"
                    className="btn-primary text-white font-semibold h-9 px-3 rounded-xl text-xs shadow-glow hover:shadow-glow-lg transition-shadow inline-flex items-center gap-1.5"
                  >
                    <Wallet size={15} aria-hidden="true" />
                    Connect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="btn-primary text-white font-semibold h-10 px-4 rounded-xl text-sm shadow-glow hover:shadow-glow-lg transition-shadow"
                  >
                    Connect wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="h-10 px-4 rounded-xl text-sm font-medium bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {!compact && (
                    <button
                      type="button"
                      onClick={openChainModal}
                      className="h-10 px-3 rounded-xl text-sm glass text-lilac hover:text-white transition-colors hidden sm:inline-flex items-center gap-1.5"
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- chain icon URL provided by RainbowKit, not a local asset
                        <img
                          src={chain.iconUrl}
                          alt=""
                          className="h-4 w-4 rounded-full"
                        />
                      )}
                      {chain.name}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="h-10 px-4 rounded-xl text-sm glass-strong text-white hover:border-magenta/40 transition-colors inline-flex items-center gap-2"
                  >
                    {account.displayName}
                    {!compact && account.displayBalance && (
                      <span className="text-lilac/60 text-xs hidden md:inline">
                        {account.displayBalance}
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
