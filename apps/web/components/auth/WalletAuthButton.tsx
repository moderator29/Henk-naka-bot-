"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useAccount, useSignMessage, useChainId, useSwitchChain } from "wagmi";
import { polygon } from "wagmi/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { buildSiweMessage } from "@/lib/auth/siwe";

/**
 * Wallet (SIWE) sign up + sign in, full client flow (RPD §5.4 / §9.3):
 *   1. Connect a wallet (RainbowKit modal) if needed.
 *   2. GET /api/auth/nonce for a single-use server nonce.
 *   3. Build a SIWE message and sign it.
 *   4. POST /api/auth/verify { message, signature }.
 *
 * On success the server mints a real Supabase session. First-time wallets are
 * routed into profile setup; returning wallets go straight into the app. The
 * signature is verified server-side and the nonce is single-use.
 */
export function WalletAuthButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();
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
      // Prefer Polygon mainnet; nudge a switch but don't hard-block signing.
      if (chainId !== polygon.id && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: polygon.id });
        } catch {
          /* user can stay on their chain; SIWE still proves ownership */
        }
      }

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
        needsOnboarding?: boolean;
        note?: string;
      };

      setStatus("done");
      if (result.session) {
        // New wallet → set up the profile; returning → into the app.
        window.location.href = result.needsOnboarding
          ? "/onboarding/profile"
          : "/explore";
      } else {
        setMessage(
          result.note ??
            "Wallet verified. Full session sign-in activates once the backend is connected."
        );
      }
    } catch (err) {
      setStatus("error");
      setMessage(friendlyError(err));
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

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/user rejected|denied|rejected the request/i.test(msg)) {
    return "Signature cancelled. Approve the signature to sign in.";
  }
  return msg || "Wallet sign-in failed.";
}
