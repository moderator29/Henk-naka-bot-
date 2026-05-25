"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits, maxUint256 } from "viem";
import { ArrowDownUp } from "lucide-react";
import { NSFW_TOKEN_ABI } from "@aurora/contracts";
import { Button } from "@/components/ui/Button";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { useToast } from "@/components/ui/Toast";
import { NSFW, USDC } from "@/lib/trade/config";
import { cn, formatNumber } from "@/lib/utils";

type Side = "buy" | "sell";

const ERC20_ALLOWANCE_ABI = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

interface Quote {
  buyAmount: string;
  transaction: { to: `0x${string}`; data: `0x${string}`; value?: string };
  issues?: { allowance?: { spender: `0x${string}` } | null };
}

/** Buy/sell $NSFW against USDC on Polygon via the 0x Swap API + wagmi. */
export function SwapPanel() {
  const { address, isConnected } = useAccount();
  const { push } = useToast();
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteErr, setQuoteErr] = useState<string | null>(null);

  // buy = spend USDC to get NSFW; sell = spend NSFW to get USDC.
  const sell = side === "buy" ? USDC : NSFW;
  const buy = side === "buy" ? NSFW : USDC;

  const balance = useReadContract({
    address: sell.address,
    abi: NSFW_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const sellBalance = balance.data ? Number(formatUnits(balance.data as bigint, sell.decimals)) : 0;

  const allowance = useReadContract({
    address: sell.address,
    abi: ERC20_ALLOWANCE_ABI,
    functionName: "allowance",
    args: address && quote?.issues?.allowance?.spender ? [address, quote.issues.allowance.spender] : undefined,
    query: { enabled: !!address && !!quote?.issues?.allowance?.spender },
  });

  const { writeContractAsync, isPending: approving } = useWriteContract();
  const { sendTransactionAsync, data: txHash, isPending: sending } = useSendTransaction();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const handled = useRef(false);

  const amountNum = Number(amount) || 0;
  const debounced = useRef<ReturnType<typeof setTimeout>>();

  // Fetch a quote (debounced) whenever the amount/side/connection changes.
  useEffect(() => {
    setQuote(null);
    setQuoteErr(null);
    if (!isConnected || !address || amountNum <= 0) return;
    clearTimeout(debounced.current);
    debounced.current = setTimeout(async () => {
      setQuoting(true);
      try {
        const sellAmount = parseUnits(amount, sell.decimals).toString();
        const res = await fetch(
          `/api/trade/quote?sellToken=${sell.address}&buyToken=${buy.address}&sellAmount=${sellAmount}&taker=${address}&slippageBps=100`
        );
        const json = await res.json();
        if (!json.ok) {
          setQuoteErr(json.error ?? "No quote available.");
          return;
        }
        setQuote(json.quote as Quote);
      } catch {
        setQuoteErr("Couldn't reach the swap service.");
      } finally {
        setQuoting(false);
      }
    }, 450);
    return () => clearTimeout(debounced.current);
  }, [amount, address, isConnected, sell.address, buy.address, sell.decimals, amountNum]);

  useEffect(() => {
    if (isSuccess && txHash && !handled.current) {
      handled.current = true;
      push({ tone: "success", title: "Swap complete", description: "Your balance will update shortly." });
      setAmount("");
      setQuote(null);
    }
  }, [isSuccess, txHash, push]);

  const buyAmount = quote
    ? Number(formatUnits(BigInt(quote.buyAmount), buy.decimals))
    : 0;
  const needsApproval =
    !!quote?.issues?.allowance?.spender &&
    (allowance.data === undefined || (allowance.data as bigint) < parseUnits(amount || "0", sell.decimals));
  const busy = approving || sending || confirming || quoting;

  async function act() {
    if (!quote) return;
    try {
      if (needsApproval && quote.issues?.allowance?.spender) {
        await writeContractAsync({
          address: sell.address,
          abi: ERC20_ALLOWANCE_ABI,
          functionName: "approve",
          args: [quote.issues.allowance.spender, maxUint256],
        });
        await allowance.refetch();
        return; // user taps again to swap once approved
      }
      handled.current = false;
      await sendTransactionAsync({
        to: quote.transaction.to,
        data: quote.transaction.data,
        value: quote.transaction.value ? BigInt(quote.transaction.value) : undefined,
      });
    } catch {
      push({ tone: "error", title: "Transaction was not sent" });
    }
  }

  const label = useMemo(() => {
    if (quoting) return "Fetching quote…";
    if (approving) return "Approving…";
    if (sending) return "Confirm in wallet…";
    if (confirming) return "Swapping…";
    if (needsApproval) return `Approve ${sell.symbol}`;
    return side === "buy" ? "Buy $NSFW" : "Sell $NSFW";
  }, [quoting, approving, sending, confirming, needsApproval, side, sell.symbol]);

  return (
    <div className="glass edge-light rounded-2xl p-5 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setSide(s); setAmount(""); }}
            className={cn(
              "h-9 rounded-lg text-sm font-semibold capitalize transition-colors",
              side === s ? "bg-gradient-primary text-white" : "text-lilac/70 hover:text-white"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-lilac/50 mb-1">
          <span>You pay</span>
          {isConnected && <span>Balance: {formatNumber(sellBalance)} {sell.symbol}</span>}
        </div>
        <div className="relative">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.0"
            className="h-12 w-full rounded-xl bg-plum/60 border border-white/10 pl-4 pr-24 text-lg text-white placeholder:text-lilac/30 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isConnected && (
              <button type="button" onClick={() => setAmount(String(sellBalance))} className="h-7 px-2 rounded-md bg-white/5 text-[0.65rem] font-semibold text-lilac/80 hover:text-white">
                MAX
              </button>
            )}
            <span className="text-sm font-medium text-white">{sell.symbol}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center -my-1">
        <span className="h-8 w-8 rounded-lg glass grid place-items-center text-lilac/60">
          <ArrowDownUp size={15} />
        </span>
      </div>

      <div>
        <div className="text-xs text-lilac/50 mb-1">You receive (estimated)</div>
        <div className="h-12 rounded-xl bg-plum/40 border border-white/5 px-4 flex items-center justify-between">
          <span className="text-lg text-white tabular-nums">{quote ? formatNumber(buyAmount) : "0.0"}</span>
          <span className="text-sm font-medium text-white">{buy.symbol}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-lilac/50">
        <span>Slippage</span>
        <span>1% · Auto routing</span>
      </div>

      {quoteErr && <p className="text-xs text-red-400">{quoteErr}</p>}

      {!isConnected ? (
        <ConnectWallet />
      ) : (
        <Button
          onClick={act}
          loading={busy}
          disabled={!quote || amountNum <= 0 || amountNum > sellBalance || busy}
          size="lg"
          className="w-full"
        >
          {amountNum > sellBalance ? `Insufficient ${sell.symbol}` : label}
        </Button>
      )}
    </div>
  );
}
