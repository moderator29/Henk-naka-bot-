# AI integration layer

Per RPD §5.7. Phase 3 wires the five cornerstones (Discovery Concierge,
Creator Co-Pilot, Smart Search, Earnings Forecaster, Subscription
Intelligence). This directory will hold:

- `client.ts` — Anthropic SDK instantiation, model defaults
- `ratelimit.ts` — Upstash-backed per-user limits per feature
- `prompts/` — versioned system prompts (one file per feature)
- `tools/` — Claude tool definitions backed by Supabase reads
- `schemas/` — Zod schemas validating structured outputs

Every AI call goes through a route handler at `/api/ai/*`. The browser
never talks to Anthropic directly.
