"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { Check, Sparkles } from "lucide-react";
import { NSFW_TOKEN_ABI, NSFW_DECIMALS } from "@aurora/contracts";
import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { useToast } from "@/components/ui/Toast";
import { useNsfwBalance } from "@/lib/web3/useNsfwBalance";
import { getSubscribeTarget, recordSubscription } from "@/lib/subscriptions/actions";
import type { SubscribeTarget } from "@/lib/subscriptions/types";
import { formatNumber } from "@/lib/utils";

/**
 * Subscribe to a creator tier with a real on-chain $NSFW transfer. USD-priced
 * tiers are converted to $NSFW at the live token price (with the tier's stored
 * token amount as the fallback when no live price is available), then recorded
 * against the resulting tx hash.
 */
export function SubscribeModal({
  tierId,
  onClose,
  onSubscribed,
}: {
  tierId: string;
  onClose: () => void;
  onSubscribed?: () => void;
}) {
  const { isConnected } = useAccount();
  const { formatted } = useNsfwBalance();
  const { push } = useToast();
  const [target, setTarget] = useState<SubscribeTarget | null | undefined>(undefined);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const recorded = useRef(false);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    getSubscribeTarget(tierId).then((t) => setTarget(t ?? null));
    fetch("/api/trade/price")
      .then((r) => r.json())
      .then((d: { price: number | null }) => setLivePrice(d?.price ?? null))
      .catch(() => setLivePrice(null));
  }, [tierId]);

  // Token amount to charge: USD price at the live rate, else the tier's token price.
  const nsfwAmount =
    target && target.priceUsd != null && livePrice && livePrice > 0
      ? target.priceUsd / livePrice
      : target?.priceNsfw ?? 0;
  const amountStr = nsfwAmount > 0 ? trimAmount(nsfwAmount) : "0";

  useEffect(() => {
    if (isSuccess && hash && !recorded.current && target) {
      recorded.current = true;
      void recordSubscription(tierId, hash, amountStr).then((res) => {
        if (res.ok) {
          push({
            tone: "success",
            title: `Subscribed to ${target.creatorName}`,
            description: `${target.tierName} is now active for 30 days.`,
          });
          onSubscribed?.();
          onClose();
        } else if (res.needsAuth) {
          push({ tone: "error", title: "Sign in to subscribe" });
        } else {
          push({ tone: "error", title: "Payment sent but recording failed", description: "Contact support with your tx hash." });
        }
      });
    }
  }, [isSuccess, hash, target, tierId, amountStr, push, onClose, onSubscribed]);

  useEffect(() => {
    if (writeError) push({ tone: "error", title: "Transaction was not sent" });
  }, [writeError, push]);

  const balance = Number(formatted || 0);
  const busy = isPending || confirming;
  const canPay =
    !!target &&
    !!target.payoutWallet &&
    nsfwAmount > 0 &&
    nsfwAmount <= balance &&
    !busy;

  function pay() {
    if (!canPay || !target?.payoutWallet) return;
    writeContract({
      address: NSFW_TOKEN_ADDRESS,
      abi: NSFW_TOKEN_ABI,
      functionName: "transfer",
      args: [target.payoutWallet as `0x${string}`, parseUnits(amountStr, NSFW_DECIMALS)],
    });
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent
        title={target ? `Subscribe to ${target.creatorName}` : "Subscribe"}
        className="w-[calc(100vw-2rem)] max-w-md"
      >
        {target === undefined ? (
          <p className="text-sm text-lilac/60 py-6 text-center">Loading tier…</p>
        ) : target === null ? (
          <p className="text-sm text-lilac/70 py-4">
            This tier is no longer available.
          </p>
        ) : target.payoutWallet === null ? (
          <p className="text-sm text-lilac/70 py-4">
            {target.creatorName} hasn&apos;t set up payouts yet. Once they connect
            a payout wallet you can subscribe.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold text-white">
                  {target.tierName}
                </span>
                <div className="text-right">
                  {target.priceUsd != null && (
                    <div className="font-display text-2xl font-bold text-gradient">
                      ${target.priceUsd.toFixed(2)}
                      <span className="text-sm font-normal text-lilac/60"> / mo</span>
                    </div>
                  )}
                  <div className="text-xs text-lilac/60">
                    {formatNumber(Number(amountStr))} $NSFW
                    {target.priceUsd != null && livePrice ? " at live price" : ""}
                  </div>
                </div>
              </div>
              {target.benefits.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {target.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-lilac/80">
                      <Check size={15} className="text-cyan flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isConnected ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-magenta">
                  <Sparkles size={22} />
                </span>
                <p className="text-sm text-lilac/70">
                  Connect your wallet to subscribe in $NSFW.
                </p>
                <ConnectWallet />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-lilac/50">
                  <span>Balance: {formatNumber(balance)} $NSFW</span>
                  {nsfwAmount > balance && (
                    <span className="text-red-400">Not enough $NSFW</span>
                  )}
                </div>
                <Button onClick={pay} loading={busy} disabled={!canPay} size="lg" className="w-full">
                  {isPending
                    ? "Confirm in wallet…"
                    : confirming
                      ? "Activating…"
                      : `Subscribe for ${formatNumber(Number(amountStr))} $NSFW`}
                </Button>
                <p className="text-[0.7rem] text-lilac/40 text-center">
                  Renews monthly. Manage or cancel anytime from your subscriptions.
                </p>
              </>
            )}
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

/** Token amount as a plain decimal string within $NSFW precision. */
function trimAmount(n: number): string {
  if (!isFinite(n) || n <= 0) return "0";
  // Keep up to 6 decimals, strip trailing zeros, avoid scientific notation.
  const fixed = n.toFixed(6).replace(/\.?0+$/, "");
  return fixed === "" ? "0" : fixed;
}
