import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Admin docs · Admin" };

interface Section {
  id: string;
  title: string;
  body: string[];
}

const SECTIONS: Section[] = [
  {
    id: "roles",
    title: "Roles & permissions",
    body: [
      "Roles are user, creator, moderator, admin, and superadmin, stored in public.user_roles. Moderator and up are staff (moderation access); admin and up can manage roles, settings, announcements, and demo data. Only a superadmin can grant or revoke superadmin.",
      "The /admin route and every admin server action re-check the role server-side via is_staff()/is_admin() and the getStaffContext() guard. Hiding a button is never the protection; the server is.",
      "To grant a role, use Users → change the role dropdown. Every change is written to the audit log.",
    ],
  },
  {
    id: "moderation",
    title: "Moderation (18+ policy)",
    body: [
      "Reports land in Moderation. Zero-tolerance reasons (involves a minor, non-consensual/leaked content) are listed first and must be actioned immediately: remove the content and suspend or ban the account.",
      "Actions on a post: remove (hidden from everyone but the author and staff) or age-restrict. On an account: suspend or ban from Users. Resolve or dismiss the report to clear the queue. Everything is audited.",
      "Triage order: open → reviewing → resolved/dismissed. Do not dismiss a minor/non-consensual report without removing the content first.",
    ],
  },
  {
    id: "creators",
    title: "Creator verification",
    body: [
      "Applications arrive in Creators (pending). Approving promotes the user (is_creator + creator profile + the creator role) and notifies them; rejecting notifies them with your optional note. Review the payout wallet and categories before approving.",
    ],
  },
  {
    id: "money",
    title: "Subscriptions, tips & payouts",
    body: [
      "Subscriptions and tips are paid on-chain in $NSFW (the same ERC-20 transfer). Tiers are priced in USD and converted at the live token price at checkout; price_nsfw is a stored fallback. Transactions lists every tip and subscription with its tx hash.",
      "Payouts go directly to the creator's payout wallet on-chain, so there is no platform-held balance to disburse. The platform fee percentage is set in Settings (basis points).",
      "Subscription recording is idempotent: each confirmed tx_hash is recorded once (unique index), and re-subscribing to a tier the fan already holds extends the existing period instead of creating a duplicate active row. The paid amount is stored on the subscription. There is no custodial auto-charge; 'auto-renew' sends the fan a renewal reminder email via the daily cron, it does not move funds.",
    ],
  },
  {
    id: "gated",
    title: "Gated media & storage",
    body: [
      "Public post media lives in the public post-media bucket. Subscriber-only media lives in the private post-media-private bucket and is never a public URL; entitled viewers (the creator or an active subscriber) get a short-lived signed URL issued server-side. Removed posts are hidden by RLS.",
    ],
  },
  {
    id: "wallet",
    title: "Wallet auth & the in-app wallet",
    body: [
      "Sign-in: connecting a wallet and signing a nonce-based SIWE message mints a real Supabase session. First-time wallets go to profile setup (username + DOB, 18+); returning wallets go straight in. The signature is verified server-side and the nonce is single-use.",
      "The in-app wallet (top of the dashboard) is separate: it powers tips, the $NSFW swap, staking, and NFT purchases. They coexist via the same wagmi provider.",
      "The Token page's live chart is gated behind this in-app wallet: visitors see a connect-wallet prompt until they connect, then the chart renders.",
      "Account-state integrity: a before-update trigger on public.users freezes privileged columns (account_status, is_creator, is_verified, wallet_address, email, and date_of_birth once set) on any self-initiated update, so a suspended or banned user cannot un-ban themselves or self-grant a role. Admin/service-role writes pass through. Bans are therefore enforced at the database, not just the UI.",
    ],
  },
  {
    id: "integrations",
    title: "Integrations & keys",
    body: [
      "System health shows which integrations are connected (by key presence, never the secret values). Keys live only in Vercel/Supabase env, never in the repo. Supabase (auth/db/storage/realtime), Anthropic (AI), Upstash (rate limits), Turnstile (bot protection), Resend (email), WalletConnect/Alchemy/0x (web3), Sentry/PostHog (observability).",
      "Rate limiting falls back to an in-memory limiter if Upstash is unset, so it is never fully off, but production should set Upstash for cross-instance limits. It covers the sensitive endpoints: every email auth action (sign-in/up, magic link, reset, resend) by IP and email, the username- and human-check routes, tips, uploads, GDPR export, the translate proxy, and the per-user daily AI limits.",
    ],
  },
  {
    id: "ai",
    title: "AI grounding & guardrails",
    body: [
      "Five AI features are wired to Claude server-side (the browser never calls Anthropic directly): the Concierge (Aura), Smart Search, Creator Co-Pilot reply suggestions, the Earnings Forecaster narrative, and Subscription Intelligence recaps. Each is auth-gated and rate-limited per user per day, and returns a clean 503 when ANTHROPIC_API_KEY is unset rather than faking output.",
      "The AI features share a non-negotiable safety floor: nothing involving minors or ambiguous age, no explicit-image generation, nothing illegal or non-consensual, no prompt/data leakage. These are appended to every system prompt and override user instructions. Edit them in lib/ai/prompts/guardrails.ts and bump the version.",
      "Each AI feature can be turned off per-user in Settings; the toggles are honored live (a disabled feature is removed from that user's interface).",
    ],
  },
  {
    id: "profiles-i18n",
    title: "Profiles, preferences & translation",
    body: [
      "Profiles support optional Telegram and X (Twitter) links, validated and normalized to canonical https URLs server-side and shown as buttons on the user's profile and their public creator page.",
      "Notification and AI preferences (in Settings) save instantly and are enforced: notification types the user turned off are not written, and disabled AI features are hidden. The notify helper checks each recipient's preferences before inserting.",
      "Translation runs through a server-side proxy (/api/translate over Google's public endpoint, rate-limited and cached). The globe control in the platform header and marketing nav, and the language setting, translate the visible page on demand for everyone; nothing is pre-translated or stored.",
    ],
  },
  {
    id: "broadcasts",
    title: "Broadcasts & news",
    body: [
      "Announcements broadcasts a message to users from one place. Compose a title, body, and optional image (no video) and pick an audience: everyone, creators, or fans. Publishing inserts the announcement, fans it out to every targeted user's notifications (real rows), sends a branded email to those with an address (Resend, env-gated), and posts it to the in-app /news feed.",
      "On /news each broadcast is likeable, commentable, and shareable by users. Keep broadcasts factual and on-brand; they reach inboxes, so use them deliberately. Every broadcast is recorded in the audit log with the recipient count.",
    ],
  },
  {
    id: "legal",
    title: "Legal documents",
    body: [
      "The Privacy Policy, Terms of Service, and Disclaimer ship as in-code defaults and are editable from Legal in the panel. Saving a document publishes it immediately to the public /legal pages (it overrides the default), bumps its version, and writes to the audit log.",
      "Content is light markdown: lines starting with '## ' are section headings; blank lines separate paragraphs. Review changes carefully, these are binding user-facing policies. The footer disclaimer and signup agreement link to these pages.",
    ],
  },
  {
    id: "demo",
    title: "Demo data & audit log",
    body: [
      "The platform ships with no demo content and auto-purges any seeded is_demo rows on the first real signup. Demo data shows current counts and a manual purge. The Audit log is append-only: every sensitive admin action records who did what, to whom, and when.",
    ],
  },
  {
    id: "incident",
    title: "Incident & escalation",
    body: [
      "For a credible report of illegal content (especially involving a minor): remove the content immediately, ban the account, preserve the audit trail, and escalate to the legal/owner contact. Do not delete the audit record. Use Maintenance mode in Settings if the platform must be taken offline for non-staff during an incident.",
    ],
  },
];

export default function AdminDocsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-6 flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center">
          <ShieldCheck size={20} className="text-white" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin playbook</h1>
          <p className="text-sm text-lilac/60">
            How to run Pleasure Coin. Internal, staff-only.
          </p>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-lilac/70 hover:text-white transition-colors"
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-6">
            <h2 className="font-display text-lg font-semibold text-white mb-2">
              {s.title}
            </h2>
            <div className="flex flex-col gap-2">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm text-lilac/75 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
