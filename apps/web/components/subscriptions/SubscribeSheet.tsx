"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { Check, Gem, Sparkles } from "lucide-react";
import { NSFW_TOKEN_ABI, NSFW_DECIMALS } from "@aurora/contracts";
import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { useToast } from "@/components/ui/Toast";
import { useNsfwBalance } from "@/lib/web3/useNsfwBalance";
import { getSubscribeTarget, recordSubscription, type SubscribeTarget } from "@/lib/subscriptions/actions";
import { SUBSCRIBER_BENEFITS, STANDARD_SUB_USD } from "@/lib/subscriptions/benefits";
import { formatNumber } from "@/lib/utils";
import type { CreatorTier } from "@/lib/creators/types";

/**
 * Subscribe sheet: the $20-standard monthly subscription, paid on-chain in
 * $NSFW (a real ERC-20 transfer to the creator's payout wallet, like tips),
 * then recorded so gated content unlocks everywhere and the subscriber badge
 * applies. Preview tiers (demo creators) show a clear preview state.
 */
export function SubscribeSheet({
  tier,
  creatorName,
  isPreview,
  onClose,
}: {
  tier: CreatorTier;
  creatorName: string;
  isPreview: boolean;
  onClose: () => void;
}) {
  const { isConnected } = useAccount();
  const { formatted } = useNsfwBalance();
  const { push } = useToast();

  const [target, setTarget] = useState<SubscribeTarget | null | undefined>(undefined);
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const recorded = useRef(false);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isPreview) {
      setTarget(null);
      return;
    }
    void getSubscribeTarget(tier.id).then((t) => setTarget(t));
  }, [tier.id, isPreview]);

  useEffect(() => {
    fetch("/api/trade/price")
      .then((r) => r.json())
      .then((d: { price?: number | null }) => setUsdPrice(typeof d.price === "number" ? d.price : null))
      .catch(() => setUsdPrice(null));
  }, []);

  useEffect(() => {
    if (isSuccess && hash && !recorded.current && target) {
      recorded.current = true;
      void recordSubscription({
        tierId: target.tierId,
        txHash: hash,
        amountNsfw: String(target.priceNsfw),
      }).then((r) => {
        if (r.ok) {
          push({ tone: "success", title: `Subscribed to ${creatorName}`, description: "Gated content is unlocked." });
          onClose();
        } else {
          push({ tone: "error", title: r.error ?? "Could not record subscription" });
        }
      });
    }
  }, [isSuccess, hash, target, creatorName, push, onClose]);

  useEffect(() => {
    if (writeError) push({ tone: "error", title: "Transaction was not sent" });
  }, [writeError, push]);

  const balance = Number(formatted || 0);
  const busy = isPending || confirming;
  const wallet = target?.payoutWallet ?? null;
  const usd = usdPrice != null ? tier.priceNsfw * usdPrice : null;
  const canPay = !isPreview && !!wallet && tier.priceNsfw <= balance && !busy;

  function subscribe() {
    if (!canPay || !wallet) return;
    writeContract({
      address: NSFW_TOKEN_ADDRESS,
      abi: NSFW_TOKEN_ABI,
      functionName: "transfer",
      args: [wallet as `0x${string}`, parseUnits(String(tier.priceNsfw), NSFW_DECIMALS)],
    });
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={`Subscribe to ${creatorName}`} className="w-[calc(100vw-2rem)] max-w-md">
        <div className="flex flex-col gap-4">
          {/* Price */}
          <div className="rounded-2xl glass edge-light p-5 text-center">
            <div className="font-display text-3xl font-bold text-white">
              ${usd != null ? usd.toFixed(2) : STANDARD_SUB_USD}
              <span className="text-base font-medium text-lilac/60"> / month</span>
            </div>
            <div className="mt-1 text-sm text-lilac/60">
              {formatNumber(tier.priceNsfw)} $NSFW · {tier.name}
            </div>
          </div>

          {/* Badge preview */}
          <div className="flex items-center gap-2.5 rounded-xl bg-magenta/10 border border-magenta/20 px-4 py-3">
            <span className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-white">
              <Gem size={15} />
            </span>
            <p className="text-sm text-lilac/85">
              You&apos;ll get the <span className="font-semibold text-white">Subscriber</span> badge and unlock everything below.
            </p>
          </div>

          {/* Benefits */}
          <ul className="space-y-2">
            {SUBSCRIBER_BENEFITS.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-lilac/85">
                <Check size={16} className="text-cyan flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          {/* Action */}
          {isPreview ? (
            <p className="text-sm text-lilac/60 rounded-xl bg-plum/40 px-4 py-3">
              This is a preview profile. Subscribing activates once this is a real onboarded creator.
            </p>
          ) : target === undefined ? (
            <p className="text-sm text-lilac/50">Loading…</p>
          ) : !wallet ? (
            <p className="text-sm text-lilac/60 rounded-xl bg-plum/40 px-4 py-3">
              {creatorName} hasn&apos;t connected a payout wallet yet, so subscriptions aren&apos;t open.
            </p>
          ) : !isConnected ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="text-sm text-lilac/70">Connect your wallet to subscribe in $NSFW.</p>
              <ConnectWallet />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-lilac/50">
                <span>Balance: {formatNumber(balance)} $NSFW</span>
                {tier.priceNsfw > balance && <span className="text-red-400">Not enough $NSFW</span>}
              </div>
              <Button onClick={subscribe} loading={busy} disabled={!canPay} size="lg" className="w-full" leftIcon={<Sparkles size={16} />}>
                {isPending ? "Confirm in wallet…" : confirming ? "Subscribing…" : `Subscribe`}
              </Button>
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
