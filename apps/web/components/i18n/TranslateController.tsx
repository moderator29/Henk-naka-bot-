"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { isSupportedLanguage } from "@/lib/i18n/languages";

/**
 * Live, on-demand page translation. When the user picks a language (from the
 * globe control in the header or the language setting), this walks the visible
 * text nodes, sends the unique strings to the /api/translate proxy (Google's
 * public endpoint), and swaps them in place, keeping each node's original text
 * so switching back to English restores it exactly. Re-runs on navigation so
 * new pages translate too. Skips inputs, code, and [data-no-translate] regions.
 */

interface TranslateContextValue {
  lang: string;
  busy: boolean;
  setLang: (lang: string) => void;
}

const TranslateContext = createContext<TranslateContextValue | null>(null);

const STORAGE_KEY = "pc_lang";
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "CODE",
  "PRE",
  "SVG",
]);
const HAS_LETTER = /\p{L}/u;

function shouldSkip(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  let el: HTMLElement | null = parent;
  while (el) {
    const tag = el.tagName;
    if (SKIP_TAGS.has(tag)) return true;
    if (el.isContentEditable) return true;
    if (el.getAttribute("data-no-translate") !== null) return true;
    el = el.parentElement;
  }
  return false;
}

function collectTextNodes(): Text[] {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue ?? "";
      if (!text.trim() || !HAS_LETTER.test(text)) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node as Text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let n = walker.nextNode();
  while (n) {
    nodes.push(n as Text);
    n = walker.nextNode();
  }
  return nodes;
}

async function fetchTranslations(
  segments: string[],
  target: string
): Promise<string[]> {
  const out: string[] = [];
  const CHUNK = 150;
  for (let i = 0; i < segments.length; i += CHUNK) {
    const slice = segments.slice(i, i + CHUNK);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: slice, target }),
      });
      if (!res.ok) {
        out.push(...slice);
        continue;
      }
      const data = (await res.json()) as { t?: string[] };
      out.push(...(data.t && data.t.length === slice.length ? data.t : slice));
    } catch {
      out.push(...slice);
    }
  }
  return out;
}

export function TranslateProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const originals = useRef<WeakMap<Text, string>>(new WeakMap());

  // Initialize from the visitor's saved choice.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isSupportedLanguage(saved) && saved !== "en") setLangState(saved);
  }, []);

  const revert = useCallback(() => {
    for (const node of collectTextNodes()) {
      const orig = originals.current.get(node);
      if (orig !== undefined) node.nodeValue = orig;
    }
    document.documentElement.dir = "ltr";
  }, []);

  const translate = useCallback(async (target: string) => {
    const nodes = collectTextNodes();
    if (nodes.length === 0) return;
    setBusy(true);
    try {
      const segments = nodes.map((n) => {
        const stored = originals.current.get(n);
        return (stored ?? n.nodeValue ?? "").trim();
      });
      const unique = Array.from(new Set(segments));
      const translated = await fetchTranslations(unique, target);
      const map = new Map<string, string>();
      unique.forEach((s, i) => map.set(s, translated[i] ?? s));

      nodes.forEach((node, i) => {
        const raw = node.nodeValue ?? "";
        if (!originals.current.has(node)) originals.current.set(node, raw);
        const trimmed = segments[i]!;
        const t = map.get(trimmed);
        if (t && t !== trimmed) {
          // Preserve the node's original leading/trailing whitespace.
          const lead = raw.match(/^\s*/)?.[0] ?? "";
          const trail = raw.match(/\s*$/)?.[0] ?? "";
          node.nodeValue = `${lead}${t}${trail}`;
        }
      });
      document.documentElement.dir = target === "ar" ? "rtl" : "ltr";
    } finally {
      setBusy(false);
    }
  }, []);

  // Apply when the language changes.
  useEffect(() => {
    if (lang === "en") {
      revert();
      return;
    }
    const id = window.setTimeout(() => void translate(lang), 50);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Re-translate freshly rendered content after navigation.
  useEffect(() => {
    if (lang === "en") return;
    const id = window.setTimeout(() => void translate(lang), 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const setLang = useCallback((next: string) => {
    if (!isSupportedLanguage(next)) return;
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  return (
    <TranslateContext.Provider value={{ lang, busy, setLang }}>
      {children}
    </TranslateContext.Provider>
  );
}

export function useTranslate(): TranslateContextValue {
  const ctx = useContext(TranslateContext);
  if (!ctx) {
    // Safe no-op default so consumers outside the provider don't crash.
    return { lang: "en", busy: false, setLang: () => {} };
  }
  return ctx;
}
