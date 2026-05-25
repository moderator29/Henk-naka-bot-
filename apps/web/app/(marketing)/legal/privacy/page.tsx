import type { Metadata } from "next";
import { LegalShell } from "../LegalShell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="May 2026">
      <p>
        This policy explains what we collect, why, and the control you have. We
        collect as little as we can to run the platform.
      </p>
      <h2>What we collect</h2>
      <p>
        Account data (email, username, display name, date of birth for age
        verification, optional country), content you post, your connected wallet
        address, engagement (follows, likes, saves, comments, tips), and basic
        usage analytics. We do not sell your personal data.
      </p>
      <h2>How we use it</h2>
      <p>
        To provide the platform, verify you are 18+, power your feed and the AI
        features, process on-chain payments, send the notifications you opt into,
        keep the service secure, and meet legal obligations.
      </p>
      <h2>Storage and security</h2>
      <p>
        Data is stored with row-level security so you only access your own
        records. We never store your wallet private keys; on-chain actions are
        always signed by you. Sensitive fields are protected at rest.
      </p>
      <h2>Your rights</h2>
      <p>
        You can edit your profile, manage notification and AI preferences,
        export, and permanently delete your account and data at any time from
        Settings. Account deletion cascades to your posts, follows, and related
        records.
      </p>
      <h2>Third parties</h2>
      <p>
        We use trusted processors for infrastructure, email, analytics, error
        monitoring, and market data. They process data only to provide their
        service. Blockchain transactions are public by nature of Polygon.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy requests, contact support through the platform. We respond to
        verified requests as required by applicable law.
      </p>
    </LegalShell>
  );
}
