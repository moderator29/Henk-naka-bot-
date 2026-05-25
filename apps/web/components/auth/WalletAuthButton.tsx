"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { buildSiweMessage } from "@/lib/auth/siwe";

/**
 * Wallet (SIWE) sign-in, full client flow (RPD §5.4 / §9.3):
 *   1. Ensure a wallet is connected (RainbowKit connect modal if not).
 *   2. GET /api/auth/nonce for a single-use server nonce.
 *   3. Build a SIWE message and have the wallet sign it.
 *   4. POST /api/auth/verify with { message, signature }.
 *
 * The server verifies the signature and nonce. Session minting completes once
 * the Supabase service role is configured server-side (the verify route
 * returns verified:true until then), the client flow itself is fully real,
 * no fake signing.
 */
export function WalletAuthButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const [status, setStatus] = useState<
    "idle" | "signing" | "verifying" | "done" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    setMessage(null);
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    try {
      setStatus("signing");
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Could not start sign-in.");
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const siwe = buildSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        uri: window.location.origin,
        nonce,
      });

      const signature = await signMessageAsync({ message: siwe });

      setStatus("verifying");
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: siwe, signature }),
      });

      if (!verifyRes.ok) {
        const { error } = await verifyRes
          .json()
          .catch(() => ({ error: "Verification failed." }));
        throw new Error(error ?? "Verification failed.");
      }

      const result = (await verifyRes.json()) as {
        session: unknown;
        note?: string;
      };

      setStatus("done");
      if (result.session) {
        window.location.href = "/feed";
      } else {
        setMessage(
          result.note ??
            "Wallet verified. Full session sign-in activates once the backend is connected."
        );
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Wallet sign-in failed."
      );
    }
  };

  const label =
    status === "signing"
      ? "Check your wallet…"
      : status === "verifying"
        ? "Verifying…"
        : isConnected
          ? "Sign in with wallet"
          : "Continue with wallet";

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="glass"
        size="lg"
        className="w-full"
        leftIcon={<Wallet size={18} />}
        loading={status === "signing" || status === "verifying"}
        onClick={onClick}
      >
        {label}
      </Button>
      {message && (
        <p
          className={`text-xs text-center ${
            status === "error" ? "text-red-400" : "text-lilac/60"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
