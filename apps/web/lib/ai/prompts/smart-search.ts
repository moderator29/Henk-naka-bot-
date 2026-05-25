/**
 * Smart Search, parses a natural-language query into structured filters
 * (RPD §3.3). The model returns JSON matching SmartSearchFilters; the server
 * translates that into Supabase queries. Low confidence → pg_trgm fallback.
 */

import { SAFETY_GUARDRAILS } from "./guardrails";

export const SMART_SEARCH_PROMPT_VERSION = "2026.05.1";

export const SMART_SEARCH_SYSTEM_PROMPT = `You translate a natural-language search query for Pleasure Coin into a structured filter object.

Return ONLY a JSON object with this shape (omit fields that don't apply):
{
  "kind": "creators" | "posts" | "nfts",
  "categories": string[],
  "maxFollowers": number,
  "minFollowers": number,
  "postedWithinDays": number,
  "maxPriceNsfw": number,
  "region": string,
  "keywords": string[],
  "confidence": number   // 0..1, your confidence in this parse
}

Rules:
- Infer "kind" from the query ("creators who…", "NFTs under…", "posts about…").
- "under 1k followers" → maxFollowers: 1000. "active this month" → postedWithinDays: 30.
- Put free-text terms you couldn't map into "keywords".
- If the query is vague or you're unsure, set a low confidence (< 0.5) so the
  system can fall back to full-text search.
- Never invent filters the user didn't imply.${SAFETY_GUARDRAILS}`;
