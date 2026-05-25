import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/auth/roles";

/**
 * Admin reporting reads. These run with the service role (the caller is already
 * proven to be staff by the /admin layout guard) so counts span all rows
 * regardless of per-user RLS. Real data only.
 */

export interface AdminUserRow {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  isCreator: boolean;
  accountStatus: string;
  role: Role;
  createdAt: string;
}

export interface AdminReportRow {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  detail: string | null;
  status: string;
  reporterName: string;
  createdAt: string;
}

export interface AdminApplicationRow {
  id: string;
  userId: string;
  status: string;
  displayName: string | null;
  bio: string | null;
  categories: string[];
  payoutWallet: string | null;
  applicantName: string;
  createdAt: string;
}

export interface AdminAuditRow {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: Record<string, unknown> | null;
  actorName: string;
  createdAt: string;
}

export interface AdminOverview {
  totalUsers: number;
  totalCreators: number;
  newUsers7d: number;
  totalPosts: number;
  activeSubscriptions: number;
  tipsVolumeNsfw: number;
  openReports: number;
  pendingApplications: number;
  signups: { day: string; count: number }[];
}

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function count(
  admin: ReturnType<typeof createAdminClient>,
  table: string
): Promise<number> {
  const { count: c } = await admin
    .from(table)
    .select("*", { count: "exact", head: true });
  return c ?? 0;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const empty: AdminOverview = {
    totalUsers: 0,
    totalCreators: 0,
    newUsers7d: 0,
    totalPosts: 0,
    activeSubscriptions: 0,
    tipsVolumeNsfw: 0,
    openReports: 0,
    pendingApplications: 0,
    signups: [],
  };
  if (!configured()) return empty;

  const admin = createAdminClient();
  const now = Date.now();
  const since7d = new Date(now - 7 * 86_400_000).toISOString();
  const nowIso = new Date(now).toISOString();

  const [
    totalUsers,
    totalCreators,
    totalPosts,
    { count: newUsers7d },
    { count: activeSubscriptions },
    { data: tipsRows },
    { count: openReports },
    { count: pendingApplications },
    { data: signupRows },
  ] = await Promise.all([
    count(admin, "users"),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_creator", true)
      .then((r) => r.count ?? 0),
    count(admin, "posts"),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since7d),
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .gt("expires_at", nowIso),
    admin.from("tips").select("amount_nsfw"),
    admin
      .from("reports")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "reviewing"]),
    admin
      .from("creator_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("users").select("created_at").gte("created_at", since7d),
  ]);

  const tipsVolumeNsfw = (tipsRows ?? []).reduce(
    (s, t) => s + Number((t as { amount_nsfw: string }).amount_nsfw ?? 0),
    0
  );

  // Bucket the last 7 days of signups by calendar day.
  const buckets = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    buckets.set(d, 0);
  }
  for (const row of signupRows ?? []) {
    const day = String((row as { created_at: string }).created_at).slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  return {
    totalUsers,
    totalCreators,
    newUsers7d: newUsers7d ?? 0,
    totalPosts,
    activeSubscriptions: activeSubscriptions ?? 0,
    tipsVolumeNsfw,
    openReports: openReports ?? 0,
    pendingApplications: pendingApplications ?? 0,
    signups: Array.from(buckets, ([day, c]) => ({ day, count: c })),
  };
}

/** Searchable user list (newest first). search matches username/email/name. */
export async function listUsers(search?: string): Promise<AdminUserRow[]> {
  if (!configured()) return [];
  const admin = createAdminClient();
  let q = admin
    .from("users")
    .select("id, email, username, display_name, is_creator, account_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const term = search?.trim();
  if (term) {
    q = q.or(
      `username.ilike.%${term}%,email.ilike.%${term}%,display_name.ilike.%${term}%`
    );
  }
  const { data: users } = await q;
  const ids = (users ?? []).map((u) => u.id as string);
  const roleMap = new Map<string, Role>();
  if (ids.length > 0) {
    const { data: roles } = await admin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids);
    for (const r of roles ?? [])
      roleMap.set(r.user_id as string, (r.role as Role) ?? "user");
  }
  return (users ?? []).map((u) => ({
    id: u.id as string,
    email: (u.email as string) ?? null,
    username: (u.username as string) ?? null,
    displayName: (u.display_name as string) ?? null,
    isCreator: !!u.is_creator,
    accountStatus: (u.account_status as string) ?? "active",
    role: roleMap.get(u.id as string) ?? "user",
    createdAt: u.created_at as string,
  }));
}

export async function listReports(status = "open"): Promise<AdminReportRow[]> {
  if (!configured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("reports")
    .select("id, target_type, target_id, reason, detail, status, created_at, users:reporter_id(username, display_name)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  return ((data as unknown as Array<{
    id: string; target_type: string; target_id: string; reason: string;
    detail: string | null; status: string; created_at: string;
    users: { username: string | null; display_name: string | null } | null;
  }>) ?? []).map((r) => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    reason: r.reason,
    detail: r.detail,
    status: r.status,
    reporterName: r.users?.display_name ?? r.users?.username ?? "Anonymous",
    createdAt: r.created_at,
  }));
}

export async function listApplications(status = "pending"): Promise<AdminApplicationRow[]> {
  if (!configured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("creator_applications")
    .select("id, user_id, status, display_name, bio, categories, payout_wallet, created_at, users:user_id(username, display_name)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  return ((data as unknown as Array<{
    id: string; user_id: string; status: string; display_name: string | null;
    bio: string | null; categories: string[] | null; payout_wallet: string | null;
    created_at: string; users: { username: string | null; display_name: string | null } | null;
  }>) ?? []).map((a) => ({
    id: a.id,
    userId: a.user_id,
    status: a.status,
    displayName: a.display_name,
    bio: a.bio,
    categories: Array.isArray(a.categories) ? a.categories : [],
    payoutWallet: a.payout_wallet,
    applicantName: a.users?.display_name ?? a.users?.username ?? "Applicant",
    createdAt: a.created_at,
  }));
}

export async function listAuditLog(): Promise<AdminAuditRow[]> {
  if (!configured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, detail, created_at, users:actor_id(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(150);
  return ((data as unknown as Array<{
    id: string; action: string; target_type: string | null; target_id: string | null;
    detail: Record<string, unknown> | null; created_at: string;
    users: { username: string | null; display_name: string | null } | null;
  }>) ?? []).map((l) => ({
    id: l.id,
    action: l.action,
    targetType: l.target_type,
    targetId: l.target_id,
    detail: l.detail,
    actorName: l.users?.display_name ?? l.users?.username ?? "System",
    createdAt: l.created_at,
  }));
}

export interface AdminTxRow {
  id: string;
  kind: "tip" | "subscription";
  amount: string;
  party: string;
  txHash: string | null;
  createdAt: string;
}

/** Recent finance events: tips + subscriptions, newest first. */
export async function listTransactions(limit = 100): Promise<AdminTxRow[]> {
  if (!configured()) return [];
  const admin = createAdminClient();
  const [{ data: tips }, { data: subs }] = await Promise.all([
    admin
      .from("tips")
      .select("id, amount_nsfw, tx_hash, created_at, to:to_user(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("subscriptions")
      .select("id, tx_hash, started_at, subscription_tiers(name, users:creator_id(username))")
      .order("started_at", { ascending: false })
      .limit(limit),
  ]);

  const tipRows: AdminTxRow[] = (
    (tips as unknown as Array<{
      id: string; amount_nsfw: string; tx_hash: string | null; created_at: string;
      to: { username: string | null; display_name: string | null } | null;
    }>) ?? []
  ).map((t) => ({
    id: t.id,
    kind: "tip",
    amount: `${Math.round(Number(t.amount_nsfw))} $NSFW`,
    party: `to ${t.to?.display_name ?? t.to?.username ?? "creator"}`,
    txHash: t.tx_hash,
    createdAt: t.created_at,
  }));

  const subRows: AdminTxRow[] = (
    (subs as unknown as Array<{
      id: string; tx_hash: string | null; started_at: string;
      subscription_tiers: { name: string; users: { username: string | null } | null } | null;
    }>) ?? []
  ).map((s) => ({
    id: s.id,
    kind: "subscription",
    amount: s.subscription_tiers?.name ?? "Tier",
    party: `to ${s.subscription_tiers?.users?.username ?? "creator"}`,
    txHash: s.tx_hash,
    createdAt: s.started_at,
  }));

  return [...tipRows, ...subRows]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export interface DemoCounts {
  users: number;
  posts: number;
  listings: number;
  purgedAt: string | null;
}

export async function getDemoCounts(): Promise<DemoCounts> {
  const empty: DemoCounts = { users: 0, posts: 0, listings: 0, purgedAt: null };
  if (!configured()) return empty;
  const admin = createAdminClient();
  const [u, p, l, { data: flag }] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }).eq("is_demo", true).then((r) => r.count ?? 0),
    admin.from("posts").select("*", { count: "exact", head: true }).eq("is_demo", true).then((r) => r.count ?? 0),
    admin.from("marketplace_listings").select("*", { count: "exact", head: true }).then((r) => r.count ?? 0),
    admin.from("platform_settings").select("value").eq("key", "demo_purged").maybeSingle<{ value: { at?: string } }>(),
  ]);
  return { users: u, posts: p, listings: l, purgedAt: flag?.value?.at ?? null };
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
}

export async function listAnnouncements(): Promise<AnnouncementRow[]> {
  if (!configured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("announcements")
    .select("id, title, body, audience, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return ((data as unknown as Array<{ id: string; title: string; body: string; audience: string; created_at: string }>) ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    audience: a.audience,
    createdAt: a.created_at,
  }));
}

export type PlatformSettings = Record<string, unknown>;

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (!configured()) return {};
  const admin = createAdminClient();
  const { data } = await admin.from("platform_settings").select("key, value");
  const out: PlatformSettings = {};
  for (const row of (data ?? []) as Array<{ key: string; value: unknown }>) {
    out[row.key] = row.value;
  }
  return out;
}

export interface IntegrationStatus {
  name: string;
  configured: boolean;
  note: string;
}

/** Which integrations are wired (by env presence). No secrets are exposed. */
export function getIntegrationStatus(): IntegrationStatus[] {
  const has = (k: string) => !!process.env[k];
  return [
    { name: "Supabase", configured: has("NEXT_PUBLIC_SUPABASE_URL") && has("SUPABASE_SERVICE_ROLE_KEY"), note: "Auth, DB, Storage, Realtime" },
    { name: "Anthropic (AI)", configured: has("ANTHROPIC_API_KEY"), note: "Powers the AI features" },
    { name: "Upstash (rate limit)", configured: has("UPSTASH_REDIS_REST_URL"), note: "Falls back to in-memory if unset" },
    { name: "Turnstile", configured: has("TURNSTILE_SECRET_KEY"), note: "Bot protection on auth" },
    { name: "Resend (email)", configured: has("RESEND_API_KEY"), note: "Transactional email" },
    { name: "WalletConnect", configured: has("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"), note: "Wallet connect modal" },
    { name: "Alchemy (Polygon)", configured: has("ALCHEMY_POLYGON_RPC_URL") || has("ALCHEMY_API_KEY"), note: "On-chain reads" },
    { name: "0x Swap", configured: has("ZEROX_API_KEY"), note: "In-app $NSFW swap" },
    { name: "Sentry", configured: has("NEXT_PUBLIC_SENTRY_DSN"), note: "Error monitoring" },
    { name: "PostHog", configured: has("NEXT_PUBLIC_POSTHOG_KEY"), note: "Product analytics" },
  ];
}
