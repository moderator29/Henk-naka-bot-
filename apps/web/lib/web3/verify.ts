import { createPublicClient, http } from "viem";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { polygon } from "viem/chains";

/**
 * Server-side SIWE signature verification, shared by wallet sign-in and
 * wallet-linking. Confirms the signature is valid for the nonce and returns
 * the proven address (lowercased) or null. Plain module (no "use server") so
 * the viem client lives outside any server-action boundary.
 */

const alchemyRpc =
  process.env.ALCHEMY_POLYGON_RPC_URL ??
  (process.env.ALCHEMY_API_KEY
    ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    : undefined);

const publicClient = createPublicClient({
  chain: polygon,
  transport: http(alchemyRpc),
});

export async function verifyWalletSignature(args: {
  message: string;
  signature: string;
  nonce: string;
}): Promise<string | null> {
  const parsed = parseSiweMessage(args.message);
  if (!parsed.nonce || parsed.nonce !== args.nonce) return null;
  if (!/^0x[0-9a-fA-F]+$/.test(args.signature)) return null;

  const valid = await verifySiweMessage(publicClient, {
    message: args.message,
    signature: args.signature as `0x${string}`,
    nonce: args.nonce,
  });
  if (!valid || !parsed.address) return null;
  return parsed.address.toLowerCase();
}
