"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

interface CopyAddressProps {
  address: string;
  label?: string;
}

export function CopyAddress({ address, label }: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable, silent no-op, no fake feedback.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-mono text-lilac hover:text-white hover:border-magenta/40 transition-colors"
      aria-label={`Copy ${label ?? "address"}`}
    >
      {label && <span className="text-lilac/60 text-[0.7rem]">{label}:</span>}
      <span>{shortenAddress(address, 6)}</span>
      {copied ? (
        <Check size={14} className="text-cyan" />
      ) : (
        <Copy
          size={14}
          className="text-lilac/60 group-hover:text-magenta transition-colors"
        />
      )}
    </button>
  );
}
