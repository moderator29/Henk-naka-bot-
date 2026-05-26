"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createBroadcast } from "@/lib/news/actions";
import { cn } from "@/lib/utils";

type Audience = "all" | "creators" | "fans";

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "creators", label: "Creators" },
  { value: "fans", label: "Fans" },
];

/**
 * Admin broadcast composer. Publishing sends the announcement to the /news
 * feed and fans it out to every targeted user's notifications + email.
 */
export function BroadcastComposer() {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function broadcast() {
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("Add a title and message.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("body", body);
      fd.set("audience", audience);
      if (image) fd.set("image", image.file);
      const res = await createBroadcast(fd);
      if (res.ok) {
        push({
          tone: "success",
          title: "Broadcast sent",
          description: `Delivered to ${res.recipients ?? 0} ${res.recipients === 1 ? "person" : "people"}.`,
        });
        setTitle("");
        setBody("");
        setImage(null);
        router.refresh();
      } else {
        setError(res.error ?? "Could not broadcast.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-white">
          <Megaphone size={15} />
        </span>
        <h2 className="font-display text-lg font-semibold text-white">New broadcast</h2>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="What do you want to tell everyone?"
        className="resize-none rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
      />

      {image && (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt="" className="h-24 rounded-lg object-cover" />
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

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setImage({ file: f, url: URL.createObjectURL(f) });
          }}
        />
        <Button size="sm" variant="glass" onClick={() => fileRef.current?.click()}>
          <ImagePlus size={15} /> Image
        </Button>
        <div className="flex items-center gap-1.5 ml-auto">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudience(a.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                audience === a.value ? "bg-gradient-primary text-white" : "glass text-lilac/70 hover:text-white"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button onClick={broadcast} loading={busy} className="self-start">
        Broadcast
      </Button>
      <p className="text-[0.7rem] text-lilac/45">
        Sends to the /news feed plus every targeted user&apos;s notifications and
        email.
      </p>
    </div>
  );
}
