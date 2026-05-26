/**
 * Default legal copy. These ship in code so the documents always exist; once an
 * admin edits a document in the panel, the DB row in legal_documents overrides
 * the default (see lib/legal/queries). Content is light markdown: lines that
 * start with "## " are section headings, blank lines separate paragraphs.
 */

export interface LegalDoc {
  slug: string;
  title: string;
  content: string;
}

const UPDATED = "Updated May 2026";

const PRIVACY = `${UPDATED}

This Privacy Policy explains what Pleasure Coin ("we", "us", the "Platform") collects, why we collect it, how we use and protect it, and the choices and rights you have. We collect as little as we need to run an adult (18+) creator platform with on-chain payments.

## Who we are
Pleasure Coin is a unified creator platform that combines social content, subscriptions, tipping, an NFT marketplace, staking, and the $NSFW token on the Polygon network. This policy applies to the website, app, and related services.

## Information we collect
Account data: email address, username, display name, date of birth (used solely to verify you are 18 or older), and optional fields such as country, bio, avatar, and cover image.
Wallet data: your public wallet address when you connect or sign in with a wallet. We never collect, request, or store private keys or seed phrases.
Content and activity: posts, Pveels, comments, messages, follows, likes, saves, subscriptions, tips, and reports you submit.
Transaction data: on-chain transaction hashes and amounts for tips, subscriptions, swaps, staking, and marketplace activity. On-chain data is public by the nature of the blockchain.
Technical data: device, browser, IP-derived region, and basic usage analytics used to keep the service secure and improve it.

## How we use your information
To operate the Platform and your account; to verify you are 18+ and gate mature content; to power your feed, search, messaging, and AI features; to process and record on-chain payments; to send the notifications and emails you opt into (including platform announcements); to detect abuse, enforce our Terms, and comply with the law.

## Age verification (18+)
The Platform is strictly for adults. We collect your date of birth at sign-up and check it server-side before granting access to mature content. Accounts that cannot verify they are 18+ are removed.

## Legal bases and consent
Where required, we rely on your consent (for example, optional email notifications and certain analytics), the performance of our contract with you (running your account), our legitimate interests (security and abuse prevention), and legal obligations.

## Sharing and processors
We do not sell your personal data. We share data only with trusted processors that help us run the service (cloud hosting and database, storage, email delivery, error monitoring, product analytics, market data, and rate-limiting), and only so they can provide their service to us. We may disclose information when required by law or to protect users and the Platform. Blockchain transactions are processed by public networks outside our control.

## Storage, security, and retention
Data is stored with row-level security so you only access your own records, and sensitive fields are protected at rest. Gated media is stored privately and served only to entitled viewers through short-lived signed links. We retain data for as long as your account is active and as needed for legal, security, and accounting purposes; you can delete your account at any time.

## Your rights and choices
From Settings you can edit your profile, manage notification and AI preferences, control who can message you, clear AI memory, and permanently delete your account and data. Deletion cascades to your posts, follows, and related records. Depending on where you live, you may also have rights to access, correct, port, or restrict processing of your data; contact us to exercise them.

## Cookies
We use essential cookies to keep you signed in and to protect against abuse, and optional analytics cookies you can decline.

## Children
The Platform is not directed to anyone under 18 and we do not knowingly collect their data. If you believe a minor is using the Platform, report it immediately so we can remove the account.

## Changes
We may update this policy. Material changes will be announced in-app, and the "Updated" date above will change.

## Contact
Questions or requests: reach us through the in-app support link or the contact address published in the app.`;

const TERMS = `${UPDATED}

These Terms of Service ("Terms") are a binding agreement between you and Pleasure Coin governing your use of the Platform. By creating an account, connecting a wallet, or using the Platform you agree to these Terms. If you do not agree, do not use the Platform.

## Eligibility (18+)
You must be at least 18 years old (or the age of majority where you live, if higher) to use the Platform. You must provide accurate age information and may be asked to re-verify. Accounts found to belong to minors are terminated.

## Your account
You are responsible for activity under your account and for keeping your credentials and wallet secure. We never ask for your seed phrase or private keys, and you should never share them. You may sign in with email or a wallet; you are responsible for the wallet you connect.

## Acceptable use
You agree not to: post or distribute content involving anyone under 18; post non-consensual, leaked, or unlawful content; harass, threaten, dox, impersonate, or defraud others; infringe intellectual property; circumvent security, rate limits, or payment; scrape or abuse the service; or upload malware. We may remove content and suspend or terminate accounts that violate these Terms.

## Creator content and ownership
Creators retain ownership of content they post and grant the Platform a limited license to host, display, and deliver it to entitled users. Creators are solely responsible for their content, for having the rights to it, and for the consent of anyone depicted. Subscriptions unlock access to a creator's gated content for the paid period; access is personal and non-transferable.

## Payments, tokens, and on-chain activity
Subscriptions, tips, swaps, staking, and marketplace purchases settle on-chain in $NSFW or other supported assets on Polygon. Blockchain transactions are irreversible, public, and outside our control; network fees may apply. Prices may be shown in USD and charged in $NSFW at the live rate. We are not a bank, exchange, custodian, or investment adviser, and nothing here is financial advice. Token values can go down as well as up.

## Subscriptions and renewals
Paid tiers renew on the cadence shown at purchase unless you turn off auto-renew. Cancelling stops the next renewal and keeps access until the current period ends. Because payments settle on-chain, refunds are generally not possible except where required by law.

## Marketplace, staking, and the token
NFT marketplace, staking, and certain token features depend on smart contracts. Where a contract is not yet wired, that functionality is clearly labeled as pending and on-chain actions are disabled. You transact at your own risk and are responsible for the wallets and assets you use.

## Moderation and enforcement
We operate a moderation system and may review, age-restrict, remove, or take down content and may warn, suspend, or ban accounts. Reports are handled by our team. We may act to comply with law or protect users.

## Disclaimers and liability
The Platform is provided "as is" without warranties. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages, for on-chain losses, or for third-party services. Some jurisdictions do not allow certain limitations, which may not apply to you.

## Termination
You may stop using the Platform and delete your account at any time. We may suspend or terminate access for violations of these Terms or to protect the Platform and its users.

## Changes and governing law
We may update these Terms; material changes will be announced in-app. Continued use after changes means you accept them. These Terms are governed by the laws referenced in the app's contact and legal section.

## Contact
Reach us through the in-app support link or the contact address published in the app.`;

const DISCLAIMER = `${UPDATED}

Please read this disclaimer carefully before using Pleasure Coin.

## Adults only (18+)
Pleasure Coin is an adults-only platform and may contain mature content. By using it you confirm you are at least 18 years old (or the age of majority where you live) and that viewing such content is legal in your jurisdiction.

## Not financial advice
$NSFW, staking, the NFT marketplace, and any token-related information on the Platform are provided for general purposes only and are not financial, investment, legal, or tax advice. Digital assets are volatile and you can lose value. Do your own research and never invest more than you can afford to lose.

## On-chain risk
Blockchain transactions are irreversible, public, and processed by networks we do not control. You are responsible for your wallet, your keys, network fees, and the transactions you sign. We never hold your private keys.

## No guarantees
The Platform is provided "as is." Features that depend on smart contracts that are not yet deployed are clearly labeled as pending. We do not guarantee uninterrupted or error-free service, the conduct of creators or users, or the outcome of any transaction.

## Third parties
Links and integrations to third-party services are provided for convenience and are governed by those parties' own terms and policies.`;

export const DEFAULT_LEGAL: Record<string, LegalDoc> = {
  privacy: { slug: "privacy", title: "Privacy Policy", content: PRIVACY },
  terms: { slug: "terms", title: "Terms of Service", content: TERMS },
  disclaimer: { slug: "disclaimer", title: "Disclaimer", content: DISCLAIMER },
};

export const LEGAL_SLUGS = ["privacy", "terms", "disclaimer"] as const;
