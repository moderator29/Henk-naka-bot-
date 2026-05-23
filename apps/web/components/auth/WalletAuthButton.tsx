"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Wallet (SIWE) sign-in entry point.
 *
 * The full flow — connect wallet, fetch nonce, build + sign the SIWE message,
 * POST to /api/auth/verify — needs a wallet connection from wagmi/RainbowKit,
 * which lands in sub-branch #9. The server endpoints (/api/auth/nonce and
 * /api/auth/verify) are already live and real.
 *
 * Until wagmi is wired this button surfaces that state honestly rather than
 * pretending to sign. PENDING_WAGMI.
 */
export function WalletAuthButton() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="glass"
        size="lg"
        className="w-full"
        leftIcon={<Wallet size={18} />}
        onClick={() =>
          setNotice(
            "Wallet sign-in activates once the wallet connector ships. Use email or Google for now."
          )
        }
      >
        Continue with wallet
      </Button>
      {notice && (
        <p className="text-xs text-lilac/60 text-center">{notice}</p>
      )}
    </div>
  );
}
