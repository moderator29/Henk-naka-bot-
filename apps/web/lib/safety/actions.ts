"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { ReportTargetType } from "./types";

/**
 * User-facing safety actions: report content/users, block, mute, and apply to
 * become a creator. All run under the caller's session so RLS enforces "act as
 * yourself" (reporter_id / blocker_id / muter_id / user_id = auth.uid()).
 */

export interface SafetyResult {
  ok: boolean;
  error?: string;
  needsAuth?: boolean;
}

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "user", "message", "profile"]),
  targetId: z.string().min(1).max(200),
  reason: z.string().min(1).max(40),
  detail: z.string().trim().max(1000).optional(),
});

export async function reportContent(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  detail?: string;
}): Promise<SafetyResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pick a reason." };
  if (parsed.data.targetId.startsWith("demo")) return { ok: true }; // demo content

  const supabase = createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    detail: parsed.data.detail ?? null,
  });
  if (error) return { ok: false, error: "Could not submit the report." };
  return { ok: true };
}

export async function blockUser(targetId: string, block: boolean): Promise<SafetyResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  if (targetId === user.id) return { ok: false, error: "You can't block yourself." };

  const supabase = createClient();
  if (block) {
    const { error } = await supabase
      .from("blocks")
      .insert({ blocker_id: user.id, blocked_id: targetId });
    if (error && error.code !== "23505") return { ok: false, error: "Could not block." };
  } else {
    await supabase
      .from("blocks")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", targetId);
  }
  return { ok: true };
}

export async function muteUser(targetId: string, mute: boolean): Promise<SafetyResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  if (targetId === user.id) return { ok: false, error: "You can't mute yourself." };

  const supabase = createClient();
  if (mute) {
    const { error } = await supabase
      .from("mutes")
      .insert({ muter_id: user.id, muted_id: targetId });
    if (error && error.code !== "23505") return { ok: false, error: "Could not mute." };
  } else {
    await supabase
      .from("mutes")
      .delete()
      .eq("muter_id", user.id)
      .eq("muted_id", targetId);
  }
  return { ok: true };
}

const applicationSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(600).optional(),
  categories: z.array(z.string().trim().min(1).max(40)).max(8),
  payoutWallet: z.string().trim().max(64).optional(),
});

export type CreatorApplicationInput = z.infer<typeof applicationSchema>;

export async function submitCreatorApplication(
  input: CreatorApplicationInput
): Promise<SafetyResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the application details." };

  const supabase = createClient();
  // Don't stack duplicate pending applications.
  const { data: existing } = await supabase
    .from("creator_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { ok: false, error: "You already have an application under review." };

  const { error } = await supabase.from("creator_applications").insert({
    user_id: user.id,
    display_name: parsed.data.displayName,
    bio: parsed.data.bio ?? null,
    categories: parsed.data.categories.length ? parsed.data.categories : null,
    payout_wallet: parsed.data.payoutWallet ?? null,
  });
  if (error) return { ok: false, error: "Could not submit the application." };

  revalidatePath("/become-creator");
  return { ok: true };
}

export interface CreatorApplicationStatus {
  isCreator: boolean;
  pending: boolean;
  lastStatus: "pending" | "approved" | "rejected" | null;
  reviewNote: string | null;
}

export async function getCreatorApplicationStatus(): Promise<CreatorApplicationStatus> {
  const user = await me();
  const empty: CreatorApplicationStatus = {
    isCreator: false,
    pending: false,
    lastStatus: null,
    reviewNote: null,
  };
  if (!user) return empty;

  const supabase = createClient();
  const [{ data: u }, { data: app }] = await Promise.all([
    supabase.from("users").select("is_creator").eq("id", user.id).maybeSingle<{ is_creator: boolean }>(),
    supabase
      .from("creator_applications")
      .select("status, review_note")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ status: "pending" | "approved" | "rejected"; review_note: string | null }>(),
  ]);

  return {
    isCreator: !!u?.is_creator,
    pending: app?.status === "pending",
    lastStatus: app?.status ?? null,
    reviewNote: app?.review_note ?? null,
  };
}
