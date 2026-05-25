"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Check, Link2, Link2Off } from "lucide-react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Section } from "@/components/settings/AccountSettings";
import { buildSiweMessage } from "@/lib/auth/siwe";
import { linkWallet, unlinkWallet } from "@/lib/profile/actions";

function shorten(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Connected wallets panel. Links a wallet to the account by proving ownership
 * with a SIWE signature (no gas, no transaction), and unlinks on request.
 * The linked address routes tips and powers wallet sign-in.
 */
export function ConnectedWallets({ linkedAddress }: { linkedAddress: string | null }) {
  const router = useRouter();
  const { push } = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const [busy, setBusy] = useState<"link" | "unlink" | null>(null);

  const connected = address?.toLowerCase() ?? null;
  const isLinkedHere = !!connected && connected === linkedAddress?.toLowerCase();

  async function link() {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    setBusy("link");
    try {
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("nonce");
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const message = buildSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        uri: window.location.origin,
        nonce,
      });
      const signature = await signMessageAsync({ message });

      const fd = new FormData();
      fd.set("message", message);
      fd.set("signature", signature);
      const res = await linkWallet(fd);
      if (!res.ok) {
        push({ tone: "error", title: res.error ?? "Could not link wallet" });
        return;
      }
      push({ tone: "success", title: "Wallet linked" });
      router.refresh();
    } catch {
      push({ tone: "error", title: "Wallet linking was cancelled" });
    } finally {
      setBusy(null);
    }
  }

  async function unlink() {
    setBusy("unlink");
    try {
      const res = await unlinkWallet();
      if (!res.ok) {
        push({ tone: "error", title: res.error ?? "Could not unlink wallet" });
        return;
      }
      push({ tone: "success", title: "Wallet unlinked" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Section
      title="Connected wallets"
      desc="Link the wallet that receives your tips and signs you in. Linking just signs a message, it never moves funds."
    >
      {linkedAddress ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-plum/40 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-9 w-9 rounded-xl glass grid place-items-center text-cyan shrink-0">
              <Wallet size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-sm text-white truncate">{shorten(linkedAddress)}</p>
              <p className="text-xs text-lilac/60 flex items-center gap-1">
                {isLinkedHere ? (
                  <>
                    <Check size={12} className="text-cyan" /> Connected in this browser
                  </>
                ) : (
                  "Linked to your account"
                )}
              </p>
            </div>
          </div>
          <Button
            variant="glass"
            size="sm"
            leftIcon={<Link2Off size={15} />}
            loading={busy === "unlink"}
            onClick={unlink}
          >
            Unlink
          </Button>
        </div>
      ) : (
        <p className="text-sm text-lilac/60">No wallet linked yet.</p>
      )}

      {!isLinkedHere && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-lilac/70 flex-1">
            {isConnected && connected
              ? `Connected wallet ${shorten(connected)} is ready to link.`
              : "Connect a wallet to link it to your account."}
          </p>
          <Button
            leftIcon={<Link2 size={15} />}
            loading={busy === "link"}
            onClick={link}
          >
            {isConnected ? (linkedAddress ? "Link this wallet" : "Link wallet") : "Connect wallet"}
          </Button>
        </div>
      )}
    </Section>
  );
}
