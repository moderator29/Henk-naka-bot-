import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRenewalReminderEmail } from "@/lib/email/resend";

/**
 * Subscription Intelligence (AI #2): renewal reminders. Runs daily (Vercel
 * cron, see vercel.json), finds subscriptions expiring within 3 days, and emails
 * each fan a reminder, honoring their notification preference. Secret-gated.
 */
export const dynamic = "force-dynamic";

const DAY = 86_400_000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Cron not configured." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "Service role not configured." }, { status: 503 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const horizon = new Date(now + 3 * DAY).toISOString();

  const { data: subs } = await admin
    .from("subscriptions")
    .select("fan_id, tier_id, expires_at")
    .gte("expires_at", new Date(now).toISOString())
    .lte("expires_at", horizon)
    .limit(500);

  const rows = (subs as { fan_id: string; tier_id: string; expires_at: string }[] | null) ?? [];
  if (rows.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const fanIds = [...new Set(rows.map((r) => r.fan_id))];
  const tierIds = [...new Set(rows.map((r) => r.tier_id))];

  const [{ data: fans }, { data: tiers }, { data: prefs }] = await Promise.all([
    admin.from("users").select("id, email").in("id", fanIds),
    admin.from("subscription_tiers").select("id, creator_id").in("id", tierIds),
    admin.from("user_preferences").select("user_id, settings").in("user_id", fanIds),
  ]);

  const emailById = new Map((fans ?? []).map((f) => [f.id as string, f.email as string | null]));
  const creatorByTier = new Map((tiers ?? []).map((t) => [t.id as string, t.creator_id as string]));
  const renewalsOff = new Set(
    (prefs ?? [])
      .filter((p) => (p as { settings?: { notifications?: { renewals?: boolean } } }).settings?.notifications?.renewals === false)
      .map((p) => (p as { user_id: string }).user_id)
  );

  const creatorIds = [...new Set([...creatorByTier.values()])];
  const { data: creators } = await admin
    .from("users")
    .select("id, display_name, username")
    .in("id", creatorIds);
  const creatorName = new Map(
    (creators ?? []).map((c) => [
      c.id as string,
      (c.display_name as string | null) ?? (c.username as string | null) ?? "a creator",
    ])
  );

  let sent = 0;
  for (const r of rows) {
    const email = emailById.get(r.fan_id);
    if (!email || renewalsOff.has(r.fan_id)) continue;
    const name = creatorName.get(creatorByTier.get(r.tier_id) ?? "") ?? "a creator";
    const daysLeft = Math.max(1, Math.ceil((new Date(r.expires_at).getTime() - now) / DAY));
    await sendRenewalReminderEmail(email, name, daysLeft);
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent });
}
