"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, SquarePen, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type MediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

interface AttachedImage {
  dataUrl: string;
  base64: string;
  mediaType: MediaType;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image?: string; // dataUrl, for display only
  imageData?: AttachedImage; // sent to the API as an image block
}

const ALLOWED_IMAGE: MediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const GREETING =
  "Hey, I'm Aura. What are you in the mood to discover tonight? Tell me a vibe, a type, a feeling, and I'll build your feed.";

/**
 * Discovery Concierge floating action button (RPD §3.1 / §6.2). Streams from
 * /api/ai/concierge via SSE and renders progressively with a typing cursor.
 * Surfaces honest states for 401 (sign in) and 503 (AI not configured) rather
 * than faking a reply.
 */
export function ConciergeFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState<AttachedImage | null>(null);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const newChat = () => {
    if (streaming) return;
    setMessages([{ role: "assistant", content: GREETING }]);
    setDraft("");
    setImage(null);
  };

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_IMAGE.includes(file.type as MediaType)) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB ceiling
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const base64 = dataUrl.split(",")[1] ?? "";
      setImage({ dataUrl, base64, mediaType: file.type as MediaType });
    };
    reader.readAsDataURL(file);
  };

  // Build the API message content, injecting an image block when present.
  function toApiContent(m: ChatMessage): unknown {
    if (m.imageData) {
      return [
        ...(m.content ? [{ type: "text", text: m.content }] : []),
        {
          type: "image",
          source: { type: "base64", media_type: m.imageData.mediaType, data: m.imageData.base64 },
        },
      ];
    }
    return m.content;
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  // The Discovery prompt bar (and anywhere else) can open Aura with a draft.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const text = (e as CustomEvent<string>).detail;
      if (typeof text === "string" && text.length > 0) setDraft(text);
    };
    window.addEventListener("aurora:concierge-open", onOpen);
    return () => window.removeEventListener("aurora:concierge-open", onOpen);
  }, []);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if ((!text && !image) || streaming) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text || (image ? "What do you make of this?" : ""),
      ...(image ? { image: image.dataUrl, imageData: image } : {}),
    };
    const next: ChatMessage[] = [...messages, userMsg];
    setMessages(next);
    setDraft("");
    setImage(null);
    setStreaming(true);
    // Reserve an assistant bubble we stream into.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // drop the static greeting; convert to API content (text or blocks)
          messages: next
            .filter((_, i) => i > 0)
            .map((m) => ({ role: m.role, content: toApiContent(m) })),
        }),
      });

      if (res.status === 401) {
        return finishWith("Sign in to chat with Aura and build your feed.");
      }
      if (res.status === 429) {
        return finishWith("You've hit today's limit. Try again tomorrow.");
      }
      if (res.status === 503) {
        return finishWith(
          "Aura isn't switched on yet, the AI key isn't configured. Soon."
        );
      }
      if (!res.ok || !res.body) {
        return finishWith("Something went wrong. Try again in a moment.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const m = line.match(/^data: (.*)$/s);
          if (!m || m[1] === undefined) continue;
          const payload = m[1];
          if (payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload) as
              | { type: "text"; text: string }
              | { type: "error"; message: string };
            if (evt.type === "text") {
              appendToLast(evt.text);
            } else if (evt.type === "error") {
              appendToLast(`\n\n(error: ${evt.message})`);
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch {
      appendToLast("\n\n(Couldn't reach Aura. Check your connection.)");
    } finally {
      setStreaming(false);
    }
  };

  function appendToLast(chunk: string) {
    setMessages((m) => {
      const copy = [...m];
      const last = copy[copy.length - 1];
      if (last && last.role === "assistant") {
        copy[copy.length - 1] = { ...last, content: last.content + chunk };
      }
      return copy;
    });
  }

  function finishWith(text: string) {
    appendToLast(text);
    setStreaming(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open Aura, your discovery concierge"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-[5.5rem] lg:bottom-6 right-3 lg:right-6 z-40 h-10 w-10 rounded-full",
          "bg-gradient-primary text-white shadow-glow flex items-center justify-center",
          "transition-transform hover:scale-105 active:scale-95",
          open && "hidden"
        )}
      >
        <Sparkles size={17} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Aura, Discovery Concierge"
            className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[28rem] glass-strong rounded-2xl shadow-glow flex flex-col overflow-hidden"
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles size={15} className="text-white" />
                </span>
                <span className="font-display font-semibold text-white">Aura</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="New chat"
                  title="New chat"
                  onClick={newChat}
                  disabled={streaming || messages.length <= 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lilac/60 hover:text-white hover:bg-white/5 disabled:opacity-40"
                >
                  <SquarePen size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lilac/60 hover:text-white hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words",
                      m.role === "user"
                        ? "bg-gradient-primary text-white rounded-br-sm"
                        : "glass text-lilac rounded-bl-sm"
                    )}
                  >
                    {m.image && (
                      // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                      <img
                        src={m.image}
                        alt="Attached"
                        className="mb-2 max-h-40 w-auto rounded-lg"
                      />
                    )}
                    {m.content}
                    {streaming &&
                      i === messages.length - 1 &&
                      m.role === "assistant" && (
                        <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-magenta animate-pulse" />
                      )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="p-3 border-t border-white/5 flex flex-col gap-2">
              {image && (
                <div className="relative w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                  <img src={image.dataUrl} alt="Attached" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setImage(null)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-plum/90 text-white grid place-items-center"
                  >
                    <X size={11} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="concierge-input" className="sr-only">
                  Message Aura
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => pickImage(e.target.files?.[0])}
                />
                <button
                  type="button"
                  aria-label="Attach an image"
                  onClick={() => fileRef.current?.click()}
                  className="h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lilac/60 hover:text-magenta hover:bg-white/5 transition-colors"
                >
                  <ImagePlus size={18} />
                </button>
                <input
                  id="concierge-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Tell me a vibe…"
                  className="flex-1 h-10 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
                />
                <Button type="submit" size="icon" loading={streaming} disabled={!draft.trim() && !image} aria-label="Send">
                  <Send size={16} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
