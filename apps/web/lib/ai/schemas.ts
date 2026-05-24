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

export const chatMessagesSchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    })
  )
  .min(1)
  .max(40);
