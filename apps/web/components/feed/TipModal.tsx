"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { Coins } from "lucide-react";
import { NSFW_TOKEN_ABI, NSFW_DECIMALS } from "@aurora/contracts";
import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { useToast } from "@/components/ui/Toast";
import { useNsfwBalance } from "@/lib/web3/useNsfwBalance";
import { getTipRecipient, recordTip } from "@/lib/engagement/actions";
import { formatNumber } from "@/lib/utils";

const QUICK = [100, 500, 1000, 5000];

/** Tip a creator in $NSFW: a real on-chain ERC-20 transfer, then recorded. */
export function TipModal({
  username,
  creatorName,
  postId,
  onClose,
}: {
  username: string;
  creatorName: string;
  postId?: string;
  onClose: () => void;
}) {
  const { isConnected } = useAccount();
  const { formatted } = useNsfwBalance();
  const { push } = useToast();
  const [wallet, setWallet] = useState<string | null | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const recorded = useRef(false);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    getTipRecipient(username).then((r) => setWallet(r?.wallet ?? null));
  }, [username]);

  useEffect(() => {
    if (isSuccess && hash && !recorded.current) {
      recorded.current = true;
      void recordTip(username, amount, hash, postId).then(() => {
        push({
          tone: "success",
          title: `Tipped ${creatorName}`,
          description: `${formatNumber(Number(amount))} $NSFW sent.`,
        });
        onClose();
      });
    }
  }, [isSuccess, hash, amount, username, postId, creatorName, push, onClose]);

  useEffect(() => {
    if (writeError) push({ tone: "error", title: "Transaction was not sent" });
  }, [writeError, push]);

  const balance = Number(formatted || 0);
  const amountNum = Number(amount) || 0;
  const busy = isPending || confirming;
  const valid = amountNum > 0 && amountNum <= balance && !!wallet && !busy;

  function send() {
    if (!valid || !wallet) return;
    writeContract({
      address: NSFW_TOKEN_ADDRESS,
      abi: NSFW_TOKEN_ABI,
      functionName: "transfer",
      args: [wallet as `0x${string}`, parseUnits(amount, NSFW_DECIMALS)],
    });
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={`Tip ${creatorName}`} className="w-[calc(100vw-2rem)] max-w-md">
        {wallet === null ? (
          <p className="text-sm text-lilac/70">
            {creatorName} hasn&apos;t set up tips yet. Once they connect a payout
            wallet you can send $NSFW directly.
          </p>
        ) : !isConnected ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-magenta">
              <Coins size={22} />
            </span>
            <p className="text-sm text-lilac/70">
              Connect your wallet to tip in $NSFW.
            </p>
            <ConnectWallet />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                inputMode="decimal"
                aria-label="Tip amount in $NSFW"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.0"
                className="h-12 w-full rounded-xl bg-plum/60 border border-white/10 pl-4 pr-20 text-lg text-white placeholder:text-lilac/30 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-lilac/50">
                $NSFW
              </span>
            </div>
            <div className="flex gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="flex-1 h-9 rounded-lg bg-white/5 text-xs font-semibold text-lilac/80 hover:text-white"
                >
                  {formatNumber(q)}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-lilac/50">
              <span>Balance: {formatNumber(balance)} $NSFW</span>
              {amountNum > balance && <span className="text-red-400">Exceeds balance</span>}
            </div>
            <Button onClick={send} loading={busy} disabled={!valid} size="lg" className="w-full">
              {isPending ? "Confirm in wallet…" : confirming ? "Sending…" : "Send tip"}
            </Button>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
