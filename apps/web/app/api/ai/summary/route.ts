import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropic, aiNotConfiguredResponse, AI_MODEL } from "@/lib/ai/client";
import { SUBSCRIPTION_SUMMARY_PROMPT } from "@/lib/ai/prompts/summary";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { checkAILimit } from "@/lib/ai/ratelimit";

/**
 * Subscription Intelligence "since your last visit" recap. Pulls the creator's
 * recent public posts and asks Claude for a short, grounded catch-up. Auth-
 * gated + rate-limited. Clean 503 until ANTHROPIC_API_KEY is configured.
 */

const bodySchema = z.object({ username: z.string().trim().min(1).max(40) });

interface PostRow {
  caption: string | null;
  media: { type?: string }[] | null;
  created_at: string;
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = await checkAILimit("subscriptionIntel", user.id);
  if (!limit.success) {
    return NextResponse.json({ ok: false, error: "Daily limit reached." }, { status: 429 });
  }

  const anthropic = getAnthropic();
  if (!anthropic) return aiNotConfiguredResponse();

  let username: string;
  try {
    username = bodySchema.parse(await req.json()).username;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: creator } = await supabase
    .from("users")
    .select("id, display_name, username")
    .eq("username", username)
    .maybeSingle<{ id: string; display_name: string | null; username: string | null }>();
  if (!creator) {
    return NextResponse.json({ ok: false, error: "Creator not found." }, { status: 404 });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("caption, media, created_at")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const list = ((posts as PostRow[] | null) ?? [])
    .map((p) => {
      const type = Array.isArray(p.media) && p.media[0]?.type?.startsWith("video")
        ? "video"
        : Array.isArray(p.media) && p.media.length > 0
          ? "photo"
          : "text";
      return `- (${type}) ${p.caption?.trim() || "no caption"}`;
    })
    .join("\n");

  const name = creator.display_name ?? creator.username ?? "This creator";
  const userMessage =
    list.length > 0
      ? `Creator: ${name}\nRecent posts (newest first):\n${list}`
      : `Creator: ${name}\nRecent posts: none.`;

  try {
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 280,
      temperature: 0.6,
      system: SUBSCRIPTION_SUMMARY_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = msg.content.find((b) => b.type === "text");
    return NextResponse.json({
      ok: true,
      summary:
        text && text.type === "text"
          ? text.text.trim()
          : "No recap available right now.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Couldn't generate the recap. Try again." },
      { status: 502 }
    );
  }
}
