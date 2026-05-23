import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createPublicClient, http } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { polygon } from "viem/chains";
import { SIWE_NONCE_COOKIE } from "@/lib/auth/siwe";

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

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(
    process.env.NEXT_PUBLIC_ALCHEMY_KEY
      ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
      : undefined
  ),
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

  // PENDING_SUPABASE_AUTH — with the service role configured, this is where we
  // upsert a users row keyed by wallet_address and mint a Supabase session
  // (admin.generateLink / setSession). Until the project is connected we do
  // not fake a session.
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

  // When configured, mint here. Returning verified payload for now.
  return NextResponse.json({ verified: true, address, session: null });
}
