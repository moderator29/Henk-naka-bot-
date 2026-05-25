"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createAnnouncement } from "@/lib/admin/actions";
import type { AnnouncementRow } from "@/lib/admin/queries";
import { relativeTime } from "@/lib/utils";

type Audience = "all" | "creators" | "fans";

export function AnnouncementManager({ initial }: { initial: AnnouncementRow[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [busy, setBusy] = useState(false);

  async function post() {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    const res = await createAnnouncement({ title: title.trim(), body: body.trim(), audience });
    setBusy(false);
    if (res.ok) {
      push({ tone: "success", title: "Announcement posted" });
      setTitle("");
      setBody("");
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Could not post" });
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="h-10 rounded-lg bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Message"
          className="resize-none rounded-lg bg-plum/60 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            aria-label="Audience"
            className="h-9 rounded-lg bg-plum/60 border border-white/10 px-2 text-xs text-white focus:border-magenta/50 focus:outline-none"
          >
            <option value="all">Everyone</option>
            <option value="creators">Creators</option>
            <option value="fans">Fans</option>
          </select>
          <Button size="sm" loading={busy} onClick={post} disabled={!title.trim() || !body.trim()}>
            Post announcement
          </Button>
        </div>
      </div>

      {initial.length === 0 ? (
        <p className="text-sm text-lilac/60 py-4 text-center">No announcements yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {initial.map((a) => (
            <li key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-white font-medium">{a.title}</p>
                <span className="text-[0.7rem] text-lilac/45 capitalize">{a.audience} · {relativeTime(a.createdAt)}</span>
              </div>
              <p className="text-sm text-lilac/70 mt-1">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
