import type { Metadata } from "next";
import { LegalShell } from "../LegalShell";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="May 2026">
      <p>
        Welcome to Pleasure Coin. By accessing or using the platform you agree
        to these Terms. If you do not agree, do not use the platform.
      </p>
      <h2>1. You must be 18 or older</h2>
      <p>
        Pleasure Coin is a strictly 18+ adult platform. You confirm you are at
        least 18 years old (or the age of majority where you live) and that it
        is legal for you to access adult content in your jurisdiction. We verify
        age at signup and may re-verify at any time.
      </p>
      <h2>2. Your account</h2>
      <p>
        You are responsible for your account, your credentials, and any wallet
        you connect. Keep them secure. You may delete your account at any time
        from Settings; deletion is permanent and removes your profile, posts,
        and data.
      </p>
      <h2>3. Creators and content</h2>
      <p>
        Creators own the content they post and grant other users access through
        subscriptions, tips, and purchases. Creators must hold the rights to
        everything they upload, must only depict consenting adults, and must
        comply with all applicable laws. Prohibited content includes anything
        involving minors, non-consensual material, or content that is illegal in
        relevant jurisdictions. Violations result in removal and termination.
      </p>
      <h2>4. Payments and the $NSFW token</h2>
      <p>
        Subscriptions, tips, NFT purchases, and staking settle on Polygon in the
        $NSFW token. Blockchain transactions are irreversible. The platform may
        charge a fee on transactions, disclosed at the time. Token value can go
        up or down; nothing here is financial advice.
      </p>
      <h2>5. Acceptable use</h2>
      <p>
        Do not harass, impersonate, scrape, attempt to bypass access controls,
        or interfere with the platform. We may suspend accounts that violate
        these Terms or applicable law.
      </p>
      <h2>6. Disclaimers and liability</h2>
      <p>
        The platform is provided &quot;as is&quot; without warranties. To the
        fullest extent permitted by law, we are not liable for indirect or
        consequential damages, lost funds from your own wallet actions, or
        third-party content.
      </p>
      <h2>7. Changes</h2>
      <p>
        We may update these Terms; material changes will be posted here. Continued
        use after changes means you accept the updated Terms.
      </p>
    </LegalShell>
  );
}
