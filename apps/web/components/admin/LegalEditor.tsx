"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { saveLegalDoc } from "@/lib/legal/actions";

export interface EditableLegalDoc {
  slug: string;
  title: string;
  content: string;
  fromDb: boolean;
}

export function LegalEditor({ docs }: { docs: EditableLegalDoc[] }) {
  const [active, setActive] = useState(docs[0]?.slug ?? "privacy");
  const current = docs.find((d) => d.slug === active) ?? docs[0];
  if (!current) return null;
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {docs.map((d) => (
          <button
            key={d.slug}
            type="button"
            onClick={() => setActive(d.slug)}
            className={
              "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors " +
              (d.slug === active
                ? "bg-gradient-primary text-white"
                : "bg-white/[0.04] text-lilac/65 hover:text-white")
            }
          >
            {d.title}
            {!d.fromDb && <span className="ml-1.5 text-[0.6rem] text-lilac/40">(default)</span>}
          </button>
        ))}
      </div>
      <DocForm key={current.slug} doc={current} />
    </div>
  );
}

function DocForm({ doc }: { doc: EditableLegalDoc }) {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await saveLegalDoc(doc.slug, title, content);
    setBusy(false);
    if (res.ok) {
      push({ tone: "success", title: "Saved", description: "Published live." });
      router.refresh();
    } else {
      push({ tone: "error", title: res.error ?? "Could not save" });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:border-magenta/50 focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={22}
        className="rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white font-mono leading-relaxed focus:border-magenta/50 focus:outline-none"
      />
      <p className="text-[0.7rem] text-lilac/45">
        Light markdown: lines starting with &quot;## &quot; are headings; blank
        lines separate paragraphs. Saving publishes immediately to the public
        page.
      </p>
      <Button onClick={save} loading={busy} className="self-start">
        Save &amp; publish
      </Button>
    </div>
  );
}
