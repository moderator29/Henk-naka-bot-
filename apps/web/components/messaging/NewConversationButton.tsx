"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SquarePen, Search } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { searchDmUsers, startConversation, type DmUser } from "@/lib/messaging/actions";

/**
 * Start a new conversation: a plus/compose button that opens a user search.
 * Picking someone finds-or-creates the canonical thread and navigates to it,
 * honoring the recipient's DM permission (surfaced as a clear message).
 */
export function NewConversationButton() {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<DmUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounce.current);
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      const r = await searchDmUsers(q);
      setResults(r);
      setLoading(false);
    }, 250);
    return () => clearTimeout(debounce.current);
  }, [q, open]);

  async function pick(u: DmUser) {
    setPendingId(u.id);
    const res = await startConversation(u.id);
    setPendingId(null);
    if (res.ok && res.conversationId) {
      setOpen(false);
      router.push(`/messages/${res.conversationId}`);
    } else if (res.needsAuth) {
      push({ tone: "error", title: "Sign in to message" });
    } else {
      push({ tone: "error", title: res.error ?? "Could not start the conversation" });
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="New message"
        onClick={() => setOpen(true)}
        className="h-9 w-9 rounded-lg grid place-items-center text-lilac/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <SquarePen size={18} />
      </button>

      {open && (
        <Modal open onOpenChange={(o) => !o && setOpen(false)}>
          <ModalContent title="New message" className="w-[calc(100vw-2rem)] max-w-md">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search people by name or @handle"
                  className="h-11 w-full rounded-xl bg-plum/60 border border-white/10 pl-9 pr-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
                />
              </div>

              <div className="max-h-72 overflow-y-auto flex flex-col gap-1">
                {loading && <p className="text-sm text-lilac/50 py-3 text-center">Searching…</p>}
                {!loading && q.trim() && results.length === 0 && (
                  <p className="text-sm text-lilac/50 py-3 text-center">No people found.</p>
                )}
                {results.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    disabled={pendingId === u.id}
                    onClick={() => pick(u)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                  >
                    <span className="h-10 w-10 rounded-full overflow-hidden bg-gradient-primary grid place-items-center text-white font-semibold flex-shrink-0">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (u.displayName ?? u.username ?? "?").charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-white truncate">
                        {u.displayName ?? u.username ?? "User"}
                      </span>
                      <span className="block text-xs text-lilac/45 truncate">
                        @{u.username ?? "user"}
                      </span>
                    </span>
                  </button>
                ))}
                {!q.trim() && (
                  <p className="text-xs text-lilac/40 py-3 text-center">
                    Find someone to message. Tip: discover creators you love and
                    DM them from here.
                  </p>
                )}
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
