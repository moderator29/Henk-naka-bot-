"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Check, Loader2 } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n/languages";
import { useTranslate } from "./TranslateController";
import { cn } from "@/lib/utils";

/**
 * Globe control that translates the visible page into the chosen language.
 * Marked data-no-translate so the menu itself never gets rewritten. Compact
 * variant for the platform header; default for the marketing nav.
 */
export function TranslateMenu({ compact = false }: { compact?: boolean }) {
  const { lang, busy, setLang } = useTranslate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = lang !== "en";

  return (
    <div ref={ref} data-no-translate className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Translate this page"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "relative h-10 rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors",
          compact ? "w-10 text-lilac/70 hover:text-white hover:bg-white/5" : "px-3 text-sm text-lilac hover:text-white",
          active && "text-magenta-light"
        )}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Languages size={18} aria-hidden="true" />
        )}
        {!compact && <span>{active ? lang.toUpperCase() : "Translate"}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 max-h-80 overflow-auto rounded-xl glass-strong border border-white/10 p-1 shadow-glow z-[70]"
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={lang === l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors",
                lang === l.code ? "bg-white/10 text-white" : "text-lilac/80 hover:bg-white/5 hover:text-white"
              )}
            >
              {l.label}
              {lang === l.code && <Check size={15} className="text-magenta-light" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
