import Link from "next/link";
import {
  Heart,
  Bookmark,
  Crown,
  Wallet,
  ShieldAlert,
  LifeBuoy,
  Scale,
  Mail,
  Cake,
} from "lucide-react";
import { Section } from "@/components/settings/AccountSettings";
import { Button } from "@/components/ui/Button";
import { SignOutEverywhere } from "@/components/settings/SignOutEverywhere";

/**
 * The remaining settings sections (account info, monetization, wallet/security,
 * content & safety, help, legal). Functional where there's an action, and clear
 * links into the dedicated surfaces (subscriptions, bookmarks, creator tools,
 * blocked/muted, legal) otherwise.
 */
export function MoreSettings({
  email,
  dateOfBirth,
  isCreator,
}: {
  email: string | null;
  dateOfBirth: string | null;
  isCreator: boolean;
}) {
  return (
    <>
      <div id="account">
        <Section title="Account" desc="Your sign-in details and age verification.">
          <Row icon={<Mail size={16} />} label="Email" value={email ?? "Connected via wallet"} />
          <Row
            icon={<Cake size={16} />}
            label="Date of birth"
            value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : "Set during signup"}
            hint="Used only to verify you're 18+. Contact support to change it."
          />
        </Section>
      </div>

      <div id="monetization">
        <Section title="Subscriptions & billing" desc="What you support and what you've saved.">
          <div className="flex flex-wrap gap-2">
            <Button variant="glass" asChild leftIcon={<Heart size={15} />}>
              <Link href="/subscriptions">My subscriptions</Link>
            </Button>
            <Button variant="glass" asChild leftIcon={<Bookmark size={15} />}>
              <Link href="/bookmarks">Bookmarks</Link>
            </Button>
          </div>
        </Section>
      </div>

      <div id="creator">
        <Section title="Creator" desc={isCreator ? "Manage your tiers, payouts, and tools." : "Start earning from subscriptions and tips."}>
          <div className="flex flex-wrap gap-2">
            <Button variant="glass" asChild leftIcon={<Crown size={15} />}>
              <Link href={isCreator ? "/dashboard" : "/become-creator"}>
                {isCreator ? "Creator dashboard" : "Become a creator"}
              </Link>
            </Button>
          </div>
        </Section>
      </div>

      <div id="wallet">
        <Section title="Wallet & security" desc="Connected wallet and your active sessions.">
          <p className="text-sm text-lilac/70">
            Connect or manage your wallet from the button in the top bar. We never
            store your private keys; on-chain actions are always signed by you.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-lilac/70">
              <Wallet size={15} /> Wallet linked via sign-in
            </span>
            <div className="ml-auto">
              <SignOutEverywhere />
            </div>
          </div>
        </Section>
      </div>

      <div id="safety">
        <Section title="Content & safety" desc="Control what you see and who can reach you.">
          <p className="text-sm text-lilac/70">
            Pleasure Coin is an 18+ platform. Manage who can DM you under Privacy
            above. Block or mute anyone from their profile&apos;s menu; blocked and
            muted accounts can&apos;t interact with you.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-lilac/50">
            <ShieldAlert size={14} /> Reports you file are reviewed by our moderation team.
          </span>
        </Section>
      </div>

      <div id="help">
        <Section title="Help & support" desc="Guides and getting in touch.">
          <div className="flex flex-wrap gap-2">
            <Button variant="glass" asChild leftIcon={<LifeBuoy size={15} />}>
              <Link href="/docs">Documentation</Link>
            </Button>
          </div>
        </Section>
      </div>

      <div id="legal">
        <Section title="Legal" desc="Policies and platform information.">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/legal/terms" className="inline-flex items-center gap-1.5 text-lilac/75 hover:text-white">
              <Scale size={14} /> Terms
            </Link>
            <Link href="/legal/privacy" className="text-lilac/75 hover:text-white">Privacy</Link>
            <Link href="/legal/disclaimer" className="text-lilac/75 hover:text-white">Disclaimer</Link>
            <Link href="/legal/dmca" className="text-lilac/75 hover:text-white">DMCA</Link>
          </div>
        </Section>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
      <span className="text-lilac/50 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-lilac/45">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
        {hint && <p className="text-xs text-lilac/50 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}
