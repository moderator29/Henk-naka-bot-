"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Section } from "@/components/settings/AccountSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateHiddenCategories } from "@/lib/profile/actions";

/**
 * Content & safety: hide categories from your feed and discovery. Posts tagged
 * with a hidden category stop appearing for you. Saves immediately.
 */
export function ContentFilters({ initial }: { initial: string[] }) {
  const { push } = useToast();
  const [cats, setCats] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function persist(next: string[]) {
    setBusy(true);
    const res = await updateHiddenCategories(next);
    setBusy(false);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not save" });
      return false;
    }
    return true;
  }

  async function add() {
    const c = draft.trim().toLowerCase();
    if (!c || cats.includes(c)) {
      setDraft("");
      return;
    }
    const next = [...cats, c].slice(0, 50);
    setCats(next);
    setDraft("");
    if (!(await persist(next))) setCats(cats);
  }

  async function remove(c: string) {
    const next = cats.filter((x) => x !== c);
    setCats(next);
    if (!(await persist(next))) setCats(cats);
  }

  return (
    <Section title="Content & safety" desc="Hide categories you'd rather not see in your feed and discovery.">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Hide a category"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="e.g. politics"
          />
        </div>
        <Button variant="glass" leftIcon={<Plus size={15} />} loading={busy} onClick={add}>
          Hide
        </Button>
      </div>
      {cats.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-plum/60 border border-white/10 px-3 py-1 text-sm text-lilac/85">
              {c}
              <button type="button" onClick={() => remove(c)} aria-label={`Unhide ${c}`} className="text-lilac/50 hover:text-white">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-lilac/55">No hidden categories. Everything shows in your feed.</p>
      )}
    </Section>
  );
}
