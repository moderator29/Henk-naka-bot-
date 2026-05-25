"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PenSquare, Search, X, BadgeCheck } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { searchUsers, type PersonResult } from "@/lib/search/actions";
import { startConversation } from "@/lib/messaging/actions";

/**
 * Start a new conversation. Opens a user picker backed by the same people
 * search as global search (name or @username), then finds-or-creates the
 * canonical thread and navigates to it.
 */
export function NewMessageButton() {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const term = q.trim();
    if (term.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const r = await searchUsers(term);
      setResults(r);
      setLoading(false);
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  async function pick(person: PersonResult) {
    setBusy(person.id);
    const res = await startConversation(person.id);
    setBusy(null);
    if (res.needsAuth) {
      push({ tone: "info", title: "Sign in to message" });
      return;
    }
    if (!res.ok || !res.conversationId) {
      push({ tone: "error", title: res.error ?? "Could not start the conversation" });
      return;
    }
    setOpen(false);
    setQ("");
    router.push(`/messages/${res.conversationId}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="New message"
        className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
      >
        <PenSquare size={16} />
      </button>

      {open && (
        <Modal open onOpenChange={(o) => !o && setOpen(false)}>
          <ModalContent title="New message" className="w-[calc(100vw-2rem)] max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search people by name or @username"
                className="h-11 w-full rounded-xl bg-plum/60 border border-white/10 pl-9 pr-9 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-lilac/40 hover:text-white">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-lilac/50 px-1 py-3">Searching…</p>
              ) : q.trim() && results.length === 0 ? (
                <p className="text-sm text-lilac/50 px-1 py-3">No one found for “{q.trim()}”.</p>
              ) : (
                <ul className="flex flex-col">
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        disabled={busy === p.id}
                        onClick={() => pick(p)}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 text-left disabled:opacity-50"
                      >
                        <span className="h-9 w-9 rounded-full overflow-hidden bg-imperial grid place-items-center text-sm font-display text-white shrink-0">
                          {p.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- avatar from storage
                            <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            p.displayName.slice(0, 1).toUpperCase()
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-medium text-white">
                            {p.displayName}
                            {p.verified && <BadgeCheck size={13} className="text-cyan" />}
                          </span>
                          <span className="block text-xs text-lilac/55 truncate">@{p.username}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
