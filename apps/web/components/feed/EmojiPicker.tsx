"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJI = [
  "😀","😍","🥰","😎","🤩","😘","😏","🙌","👏","🔥",
  "✨","💫","⭐","💖","💜","💙","💎","🚀","🌙","🌈",
  "🎉","🥳","💰","🤑","👀","💅","😈","🫦","🍑","💋",
  "😅","😭","🥹","🤤","😋","🤝","💪","🙏","👑","⚡",
];

/**
 * Lightweight emoji picker. No dependency, just a curated grid that calls
 * onPick with the chosen emoji so the composer can insert it.
 */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Add emoji"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-xl flex items-center justify-center text-lilac/60 hover:text-magenta hover:bg-white/5 transition-colors"
      >
        <Smile size={20} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute bottom-12 left-0 z-50 glass-strong rounded-2xl p-3 shadow-glass w-64">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    onPick(e);
                    setOpen(false);
                  }}
                  className="h-7 w-7 rounded-lg text-lg leading-none hover:bg-white/10"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
