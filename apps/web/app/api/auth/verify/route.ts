import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createPublicClient, http } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { polygon } from "viem/chains";
import { SIWE_NONCE_COOKIE } from "@/lib/auth/siwe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies a SIWE signature, enforces single-use nonce + replay protection,
 * then (when Supabase admin is configured) mints a session for the wallet.
 *
 * The signature verification + nonce check are fully real here. The final
 * "mint a Supabase session for this wallet" step depends on the Supabase
 * service role being configured; until env is set it returns 503 with a
 * clear message rather than faking a session. PENDING_SUPABASE_AUTH for the
 * session-mint wiring once the project keys land.
 */

const bodySchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid signature"),
});

// Server-side Alchemy RPC: prefer the full URL, else build from the key, else
// fall back to the public RPC so verification still works without a key.
const alchemyRpc =
  process.env.ALCHEMY_POLYGON_RPC_URL ??
  (process.env.ALCHEMY_API_KEY
    ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : undefined);

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(alchemyRpc),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const nonceCookie = cookies().get(SIWE_NONCE_COOKIE)?.value;
  if (!nonceCookie) {
    return NextResponse.json(
      { error: "Nonce expired or missing. Request a new one." },
      { status: 401 }
    );
  }

  const parsed = parseSiweMessage(body.message);
  if (!parsed.nonce || parsed.nonce !== nonceCookie) {
    return NextResponse.json({ error: "Nonce mismatch" }, { status: 401 });
  }

  const valid = await verifySiweMessage(publicClient, {
    message: body.message,
    signature: body.signature as `0x${string}`,
    nonce: nonceCookie,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Single-use: clear the nonce so the signature can't be replayed.
  cookies().delete(SIWE_NONCE_COOKIE);

  const address = parsed.address;
  if (!address) {
    return NextResponse.json({ error: "No address in message" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        verified: true,
        address,
        session: null,
        note: "Signature verified. Session minting activates once SUPABASE_SERVICE_ROLE_KEY is set.",
      },
      { status: 200 }
    );
  }

  // Mint a real Supabase session for this wallet: ensure an auth user keyed by
  // a deterministic wallet email exists, generate a one-time link, then
  // exchange it for a session (which writes the auth cookies). Fail-safe: any
  // error falls back to verified-without-session rather than crashing.
  try {
    const email = `${address.toLowerCase()}@wallet.pleasurecoin.app`;
    const admin = createAdminClient();

    await admin.auth.admin
      .createUser({
        email,
        email_confirm: true,
        user_metadata: { wallet_address: address },
      })
      .catch(() => {
        /* already exists */
      });

    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (linkErr || !tokenHash) throw new Error("link");

    const supabase = createClient();
    const { data: sess, error: otpErr } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash,
    });
    if (otpErr || !sess.session || !sess.user) throw new Error("otp");

    await admin
      .from("users")
      .update({ wallet_address: address })
      .eq("id", sess.user.id);

    // First-time wallet accounts have no username yet, so route them into
    // profile setup; returning wallets (username set) go straight to the app.
    const { data: profile } = await admin
      .from("users")
      .select("username")
      .eq("id", sess.user.id)
      .maybeSingle<{ username: string | null }>();
    const needsOnboarding = !profile?.username;

    return NextResponse.json({ verified: true, address, session: true, needsOnboarding });
  } catch {
    return NextResponse.json(
      {
        verified: true,
        address,
        session: null,
        note: "Signature verified. Completing wallet sign-in didn't finish, you can also sign in with email.",
      },
      { status: 200 }
    );
  }
}
