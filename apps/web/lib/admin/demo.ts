import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Demo data control. The platform ships with no demo content, but if any was
 * ever seeded, purge_demo_content() (defined in 0005_demo_flags) removes every
 * is_demo row. We call it once automatically the first time a real account is
 * created, and admins can run it on demand from the panel.
 */

const PURGED_KEY = "demo_purged";

/** Run the purge unconditionally (admin-triggered). */
export async function purgeDemoContent(): Promise<{ ok: boolean }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("purge_demo_content");
    if (error) return { ok: false };
    await admin
      .from("platform_settings")
      .upsert({ key: PURGED_KEY, value: { at: new Date().toISOString() } }, { onConflict: "key" });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Purge demo content once, on first real signup. Guarded by a platform_settings
 * flag so it runs a single time and never on every signup.
 */
export async function maybePurgeDemoContent(): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("platform_settings")
      .select("key")
      .eq("key", PURGED_KEY)
      .maybeSingle();
    if (data) return; // already purged
    await purgeDemoContent();
  } catch {
    // Best-effort; the owner can also purge manually via SQL / admin panel.
  }
}
