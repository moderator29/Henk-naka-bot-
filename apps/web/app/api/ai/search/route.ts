import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { SMART_SEARCH_SYSTEM_PROMPT } from "@/lib/ai/prompts/smart-search";
import {
  smartSearchFiltersSchema,
  type SmartSearchFilters,
} from "@/lib/ai/schemas";
import { checkAILimit } from "@/lib/ai/ratelimit";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * Smart Search (RPD §3.3). Parses the natural-language query into structured
 * filters via Claude, then runs them against Supabase. If the AI isn't
 * configured or returns low confidence, falls back to pg_trgm full-text search
 * so the user always gets results. Never fabricates results, empty when the
 * DB is unconfigured/unseeded.
 */
const CONFIDENCE_FLOOR = 0.5;

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const limit = await checkAILimit("smartSearch", user.id);
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  let query: string;
  try {
    const body = await req.json();
    query = String(body.query ?? "").trim().slice(0, 300);
    if (!query) throw new Error("empty");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const filters = await parseQuery(query);
  const usedAI = filters !== null && filters.confidence >= CONFIDENCE_FLOOR;
  const results = await runSearch(query, usedAI ? filters : null);

  return NextResponse.json({
    mode: usedAI ? "ai" : "fulltext",
    filters: usedAI ? filters : null,
    results,
  });
}

async function parseQuery(query: string): Promise<SmartSearchFilters | null> {
  const anthropic = getAnthropic();
  if (!anthropic) return null;
  try {
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      temperature: 0,
      system: SMART_SEARCH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }],
    });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return null;
    const json = JSON.parse(text.text);
    return smartSearchFiltersSchema.parse(json);
  } catch {
    return null;
  }
}

interface SearchResult {
  kind: "creator" | "post";
  id: string;
  title: string;
  subtitle: string;
}

async function runSearch(
  query: string,
  filters: SmartSearchFilters | null
): Promise<SearchResult[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }
  const supabase = createClient();
  const kind = filters?.kind ?? "creators";

  // The text to match on: AI keywords when we have them, else the raw query.
  // Sanitized to the characters PostgREST `ilike`/`or` filters accept so a
  // stray comma or paren can't break the query.
  const searchText = (filters?.keywords?.join(" ") ?? query)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim();

  if (kind === "posts") {
    let q = supabase
      .from("posts")
      .select("id, caption, category")
      .is("tier_required", null)
      .order("created_at", { ascending: false })
      .limit(20);
    // ilike keeps the fallback working without depending on a full-text index.
    if (searchText) q = q.ilike("caption", `%${searchText}%`);
    const { data } = await q;
    return (data ?? []).map((p) => ({
      kind: "post" as const,
      id: p.id as string,
      title: (p.caption as string)?.slice(0, 80) ?? "Post",
      subtitle: (p.category as string) ?? "",
    }));
  }

  // creators
  let q = supabase
    .from("creator_profiles")
    .select("user_id, subscriber_count, users!inner(username, display_name, bio)")
    .order("subscriber_count", { ascending: false })
    .limit(20);
  if (filters?.maxFollowers != null) {
    q = q.lte("subscriber_count", filters.maxFollowers);
  }
  if (filters?.minFollowers != null) {
    q = q.gte("subscriber_count", filters.minFollowers);
  }
  // Match the query text against the creator's name/handle/bio. Without this
  // the no-AI fallback ignored the query entirely and returned a generic list.
  if (searchText) {
    q = q.or(
      `username.ilike.%${searchText}%,display_name.ilike.%${searchText}%,bio.ilike.%${searchText}%`,
      { referencedTable: "users" }
    );
  }
  const { data } = await q;
  type Row = {
    user_id: string;
    subscriber_count: number;
    users: { username: string | null; display_name: string | null } | null;
  };
  return ((data as unknown as Row[]) ?? [])
    .filter((r) => r.users?.username)
    .map((r) => ({
      kind: "creator" as const,
      id: r.users!.username!,
      title: r.users!.display_name ?? r.users!.username!,
      subtitle: `${r.subscriber_count} subscribers`,
    }));
}
