"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createAnnouncement } from "@/lib/admin/actions";

export function AnnouncementForm() {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "creators" | "fans">("all");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await createAnnouncement({ title, body, audience });
    setBusy(false);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not post" });
      return;
    }
    push({ tone: "success", title: "Announcement posted" });
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <div className="glass edge-light rounded-2xl p-5 flex flex-col gap-3">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's new" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-lilac/80">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
          placeholder="Write the announcement"
        />
      </div>
      <div className="flex items-center gap-2">
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as "all" | "creators" | "fans")}
          className="h-10 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:outline-none"
        >
          <option value="all">Everyone</option>
          <option value="creators">Creators</option>
          <option value="fans">Fans</option>
        </select>
        <Button className="ml-auto" leftIcon={<Megaphone size={15} />} loading={busy} onClick={submit}>
          Post announcement
        </Button>
      </div>
    </div>
  );
}
