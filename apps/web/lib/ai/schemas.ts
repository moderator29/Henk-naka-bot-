import { z } from "zod";

/** Structured-output schemas enforced on AI responses (RPD §5.7). */

export const smartSearchFiltersSchema = z.object({
  kind: z.enum(["creators", "posts", "nfts"]).optional(),
  categories: z.array(z.string()).optional(),
  maxFollowers: z.number().int().nonnegative().optional(),
  minFollowers: z.number().int().nonnegative().optional(),
  postedWithinDays: z.number().int().positive().optional(),
  maxPriceNsfw: z.number().nonnegative().optional(),
  region: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).default(0),
});

export type SmartSearchFilters = z.infer<typeof smartSearchFiltersSchema>;

export const replySuggestionsSchema = z.array(z.string().min(1).max(280)).max(3);

// Message content is either plain text or a block array (text + an uploaded,
// non-explicit image) so users can show Aura a picture. Images are base64,
// capped so a request can't be abused.
const textBlock = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(4000),
});
const imageBlock = z.object({
  type: z.literal("image"),
  source: z.object({
    type: z.literal("base64"),
    media_type: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
    data: z.string().max(7_000_000),
  }),
});

export const chatMessagesSchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.union([
        z.string().min(1).max(4000),
        z.array(z.union([textBlock, imageBlock])).min(1).max(6),
      ]),
    })
  )
  .min(1)
  .max(40);
