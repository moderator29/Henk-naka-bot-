"use client";

import { Card } from "@/components/ui/Card";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { useNsfwBalance } from "@/lib/web3/useNsfwBalance";
import { formatNumber } from "@/lib/utils";

/**
 * Shows the connected wallet's live $NSFW balance (real on-chain read). The
 * token is deployed, so this is a real integration even while the staking
 * contract itself remains PENDING_CONTRACT_ADDRESS.
 */
export function WalletBalanceCard() {
  const { isConnected, formatted, isLoading, error } = useNsfwBalance();

  if (!isConnected) {
    return (
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Connect to see your balance
          </h2>
          <p className="mt-1 text-sm text-lilac/60">
            Connect a wallet to view your $NSFW and stake.
          </p>
        </div>
        <ConnectWallet />
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-lilac/50 mb-1">
        Your $NSFW balance
      </div>
      {error ? (
        <p className="text-sm text-red-400">
          Couldn&apos;t read balance. Check your network connection.
        </p>
      ) : (
        <div className="font-display text-3xl font-semibold text-white">
          {isLoading ? (
            <span className="text-lilac/40">…</span>
          ) : (
            <>
              {formatNumber(Number(formatted))}{" "}
              <span className="text-gradient">$NSFW</span>
            </>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-lilac/50">
        Staking actions unlock once the staking contract address is wired
        (currently <span className="font-mono">PENDING_CONTRACT_ADDRESS</span>
        ).
      </p>
    </Card>
  );
}
