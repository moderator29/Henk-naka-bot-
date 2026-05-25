import { Check, Minus } from "lucide-react";

export const metadata = { title: "Admin · System" };

/**
 * Integration health. Reports only whether each integration's env is present
 * (server-side) — never the secret values. A real connectivity probe can layer
 * on later; presence is the first signal.
 */
const INTEGRATIONS: { label: string; env: string[] }[] = [
  { label: "Supabase (DB / Auth / Storage / Realtime)", env: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] },
  { label: "Supabase service role (admin)", env: ["SUPABASE_SERVICE_ROLE_KEY"] },
  { label: "Database (Drizzle)", env: ["DATABASE_URL"] },
  { label: "Anthropic (AI)", env: ["ANTHROPIC_API_KEY"] },
  { label: "Upstash (rate limits)", env: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"] },
  { label: "WalletConnect", env: ["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"] },
  { label: "Alchemy (Polygon RPC)", env: ["ALCHEMY_POLYGON_RPC_URL"] },
  { label: "Turnstile (bot check)", env: ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"] },
  { label: "Resend (email)", env: ["RESEND_API_KEY"] },
  { label: "0x (swap)", env: ["ZEROX_API_KEY"] },
  { label: "GoldRush", env: ["GOLDRUSH_API_KEY"] },
  { label: "Sentry", env: ["NEXT_PUBLIC_SENTRY_DSN"] },
  { label: "PostHog", env: ["NEXT_PUBLIC_POSTHOG_KEY"] },
  { label: "Staking contract", env: ["NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS"] },
  { label: "NFT contracts", env: ["NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES"] },
];

export default function AdminSystemPage() {
  const rows = INTEGRATIONS.map((i) => ({
    label: i.label,
    ok: i.env.every((k) => !!process.env[k]),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">System &amp; integrations</h1>
      <p className="text-sm text-lilac/60 mb-6">
        Whether each integration is configured on the server. Secret values are never shown.
      </p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.label} className="glass rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className={`h-6 w-6 rounded-lg grid place-items-center ${r.ok ? "bg-green-500/15 text-green-400" : "bg-white/5 text-lilac/40"}`}>
              {r.ok ? <Check size={14} /> : <Minus size={14} />}
            </span>
            <span className="text-sm text-white">{r.label}</span>
            <span className={`ml-auto text-xs ${r.ok ? "text-green-400" : "text-lilac/40"}`}>
              {r.ok ? "Configured" : "Not set"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
