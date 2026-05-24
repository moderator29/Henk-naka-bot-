"use client";

import { useState, type FormEvent } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

/** Fires the event ConciergeFab listens for, optionally prefilling the draft. */
export function openConcierge(text?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("aurora:concierge-open", { detail: text ?? "" })
  );
}

/**
 * The Discovery Concierge entry: a calm prompt bar, not a loud banner. Opening
 * it hands the text to Aura (the streaming concierge) rather than navigating.
 */
export function ConciergePrompt() {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    openConcierge(value.trim());
  };

  return (
    <form
      onSubmit={submit}
      className="glass glass-featured edge-light rounded-2xl p-2 pl-4 flex items-center gap-3"
    >
      <Sparkles size={18} className="text-magenta shrink-0" aria-hidden="true" />
      <label htmlFor="concierge-prompt" className="sr-only">
        Tell Aura what you are into
      </label>
      <input
        id="concierge-prompt"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tell me what you're into and I'll curate your feed"
        className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-lilac/50 focus:outline-none h-10"
      />
      <button
        type="submit"
        className="btn-primary text-white rounded-xl h-9 px-4 text-sm font-semibold inline-flex items-center gap-1 shrink-0"
      >
        <span className="hidden sm:inline">Ask Aura</span>
        <ArrowRight size={15} aria-hidden="true" />
      </button>
    </form>
  );
}
