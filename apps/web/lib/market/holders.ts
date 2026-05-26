import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";

/**
 * $NSFW holder count. Neither CoinGecko, CoinMarketCap, nor Alchemy expose it
 * directly. Order of sources: GoldRush (Covalent) when a key is set, then
 * Blockscout's public Polygon API (keyless, so the count shows out of the box),
 * then PolygonScan Pro. Returns null (never a fabricated number) when every
 * source is unavailable.
 */
export async function getHolderCount(): Promise<number | null> {
  return (
    (await fromGoldRush()) ??
    (await fromBlockscout()) ??
    (await fromPolygonscan())
  );
}

async function fromBlockscout(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://polygon.blockscout.com/api/v2/tokens/${NSFW_TOKEN_ADDRESS}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      holders?: string | number;
      holders_count?: string | number;
    };
    const raw = json.holders ?? json.holders_count;
    const n = typeof raw === "string" ? Number(raw) : raw;
    return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
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
