import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";

/**
 * $NSFW holder count. Neither CoinGecko, CoinMarketCap, nor Alchemy expose it
 * directly, so this uses GoldRush (Covalent) Foundational API: token_holders_v2
 * returns the exact total in pagination with a single page-size=1 call.
 * Fallback: PolygonScan Pro tokenholdercount. Returns null (never a fabricated
 * number) when no provider key is set or the call fails.
 */
export async function getHolderCount(): Promise<number | null> {
  return (await fromGoldRush()) ?? (await fromPolygonscan());
}

async function fromGoldRush(): Promise<number | null> {
  const key = process.env.GOLDRUSH_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.covalenthq.com/v1/137/tokens/${NSFW_TOKEN_ADDRESS}/token_holders_v2/?page-size=1`,
      { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { pagination?: { total_count?: number } };
    };
    return json.data?.pagination?.total_count ?? null;
  } catch {
    return null;
  }
}

async function fromPolygonscan(): Promise<number | null> {
  const key = process.env.POLYGONSCAN_API_KEY ?? process.env.ETHERSCAN_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?chainid=137&module=token&action=tokenholdercount&contractaddress=${NSFW_TOKEN_ADDRESS}&apikey=${key}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { status?: string; result?: string };
    if (json.status !== "1" || !json.result) return null;
    const n = Number(json.result);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
