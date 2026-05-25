export const metadata = { title: "Admin · Docs" };

/**
 * Internal operational docs for the core team. Admin-gated by the /admin
 * layout. Plain, detailed playbook, kept in sync with how the platform runs.
 */
const SECTIONS: { h: string; body: string[]; list?: string[] }[] = [
  {
    h: "Roles & access",
    body: [
      "Roles live in the user_roles table: user, creator, moderator, admin, superadmin. The /admin route is gated server-side (layout) to moderator and above; role changes and the audit log require admin and above.",
      "Grant a role with the SQL in migration 0013 (or change it from Users → role dropdown). Never put roles on the users table, they'd be self-grantable.",
    ],
  },
  {
    h: "Moderation (Reports)",
    body: [
      "The Reports queue lists user-submitted reports against posts, Pveels, comments, messages, and users. For an 18+ platform, act quickly on anything implying a minor, non-consent, or illegal content, remove and suspend, then escalate.",
    ],
    list: [
      "Resolve / Dismiss: closes the report and records who closed it.",
      "Remove content: hides a post/Pveel (is_removed) or deletes a comment everywhere.",
      "Suspend user: sets is_suspended; use for repeat or severe violations.",
      "Every action writes to the audit log.",
    ],
  },
  {
    h: "Users",
    body: [
      "Search by name, @username, or email. Admins can change a user's role; moderators can suspend/unsuspend. Suspending blocks the account; deletion (right to erasure) is the user-initiated flow in their settings or via support.",
    ],
  },
  {
    h: "Gating & media",
    body: [
      "Public media lives in public buckets; subscriber-only media lives in the private gated-media bucket and is only served via short-lived signed URLs after the entitlement check. A non-subscriber never receives the file, only a locked preview. Never weaken this to a visual blur.",
    ],
  },
  {
    h: "Wallet auth & in-app wallet",
    body: [
      "Two separate things: (1) wallet sign-in/up authenticates with a SIWE signature (server-verified, single-use nonce) and mints a Supabase session; first-time wallets go through onboarding. (2) The in-app connected wallet (top of the dashboard) powers tips, subscribe, staking, and swaps. We never touch private keys or seed phrases.",
    ],
  },
  {
    h: "Money: subscriptions, tips, payouts",
    body: [
      "Subscriptions and tips settle on-chain in $NSFW directly to the creator's wallet. Tiers are creator-set (Settings → Creator tiers). Automated payout scheduling is pending the payout contract (PENDING_CONTRACT_ADDRESS); until then funds are already in the creator's wallet.",
    ],
  },
  {
    h: "Demo data",
    body: [
      "Demo content is flagged is_demo and only shown when live data is empty. It's purged automatically on the first real signup, and you can purge it manually (purge_demo_content). Demo content is never real adult media.",
    ],
  },
  {
    h: "Integrations & keys",
    body: [
      "Supabase (DB/Auth/Storage/Realtime), WalletConnect, Alchemy (Polygon RPC), CoinGecko (price), Resend (email), Upstash (rate limits), Turnstile (bot check), Sentry + PostHog (observability), Anthropic (AI). Keys live in environment variables only (see .env.example for exact names), never in the repo or client.",
    ],
  },
  {
    h: "AI grounding & guardrails",
    body: [
      "The assistant is grounded in platform knowledge + the user's interests/follows/trending (honoring their AI toggle and persona memory). Hard limits are enforced in the system prompt: nothing involving minors or illegal, text-only, never generates or requests explicit imagery. If you change the persona, keep these limits.",
    ],
  },
  {
    h: "Audit log & incidents",
    body: [
      "Every sensitive admin action is appended to the audit log (who, what, when, to whom). For incidents (a leak, an integration outage, a severe content violation), suspend/remove first, record in the audit trail, then escalate to the admin/CEO.",
    ],
  },
];

export default function AdminDocsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Admin docs</h1>
      <p className="text-sm text-lilac/60 mb-8">The operational playbook for running Pleasure Coin.</p>
      <div className="flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg font-semibold text-white mb-2">{s.h}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="text-sm text-lilac/75 leading-relaxed mb-2">{p}</p>
            ))}
            {s.list && (
              <ul className="mt-1 space-y-1.5">
                {s.list.map((li, i) => (
                  <li key={i} className="text-sm text-lilac/75 flex gap-2">
                    <span className="text-magenta">·</span> {li}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
