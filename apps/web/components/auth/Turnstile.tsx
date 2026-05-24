"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ShieldCheck } from "lucide-react";

/**
 * Cloudflare Turnstile widget. Renders the real challenge when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; calls onVerify with the token on
 * success. When the site key isn't configured yet it shows a labeled dev
 * passthrough so the flow still works locally (PENDING_TURNSTILE_KEYS).
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "dark" | "light" | "auto";
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey || !ready || !ref.current || !window.turnstile) return;
    if (widgetId.current) return;
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token) => onVerify(token),
      "expired-callback": () => onExpire?.(),
      "error-callback": () => onExpire?.(),
    });
  }, [siteKey, ready, onVerify, onExpire]);

  // Dev passthrough when no site key is configured.
  if (!siteKey) {
    return (
      <button
        type="button"
        onClick={() => onVerify("dev-bypass-token")}
        className="w-full glass rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-lilac/70 hover:text-white hover:border-cyan/40 transition-colors"
      >
        <ShieldCheck size={18} className="text-cyan" />
        <span className="text-left">
          Verify you are human
          <span className="block text-[0.65rem] text-lilac/40">
            Turnstile activates once the site key is configured. Tap to continue.
          </span>
        </span>
      </button>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[65px]" data-testid="turnstile-widget" />
    </>
  );
}
