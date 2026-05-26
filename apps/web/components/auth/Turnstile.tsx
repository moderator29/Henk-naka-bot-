"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ShieldCheck, RotateCcw } from "lucide-react";

/**
 * Cloudflare Turnstile widget. Renders the real challenge when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; calls onVerify with the token on
 * success. Centered, with a clean error + retry state. When the site key isn't
 * configured it shows a single labeled passthrough (dev only).
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
  onError?: () => void;
}

export function Turnstile({ onVerify, onExpire, onError }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);

  const render = useCallback(() => {
    if (!siteKey || !ref.current || !window.turnstile) return;
    if (widgetId.current) return;
    setErrored(false);
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token) => onVerify(token),
      "expired-callback": () => onExpire?.(),
      "error-callback": () => {
        setErrored(true);
        onError?.();
      },
    });
  }, [siteKey, onVerify, onExpire, onError]);

  useEffect(() => {
    if (ready) render();
  }, [ready, render]);

  const retry = () => {
    setErrored(false);
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    } else {
      widgetId.current = null;
      render();
    }
  };

  // Dev passthrough when no site key is configured.
  if (!siteKey) {
    return (
      <button
        type="button"
        onClick={() => onVerify("dev-bypass-token")}
        className="w-full glass edge-light rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-lilac/80 hover:text-white transition-colors"
      >
        <ShieldCheck size={18} className="text-cyan shrink-0" />
        <span className="text-left">
          Verify you are human
          <span className="block text-[0.65rem] text-lilac/40">
            Turnstile activates once the site key is configured.
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
      <div className="flex flex-col items-center gap-3 w-full">
        <div ref={ref} className="min-h-[65px] flex items-center justify-center" data-testid="turnstile-widget" />
        {errored && (
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1.5 text-xs text-lilac/70 hover:text-white"
          >
            <RotateCcw size={13} /> Verification didn&apos;t load. Retry
          </button>
        )}
      </div>
    </>
  );
}
