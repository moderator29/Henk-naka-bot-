import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";

/**
 * CoinGecko helpers for the trade terminal. The $NSFW coin id is resolved from
 * its Polygon contract (cached a day), then used for OHLC. All calls are
 * server-side with revalidation. No key required; COINGECKO_API_KEY raises the
 * rate limit when present.
 */

const BASE = "https://api.coingecko.com/api/v3";

function headers(): HeadersInit {
  return process.env.COINGECKO_API_KEY
    ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
    : {};
}

export async function resolveCoinId(): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE}/coins/polygon-pos/contract/${NSFW_TOKEN_ADDRESS.toLowerCase()}`,
      { headers: headers(), next: { revalidate: 86_400 } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { id?: string };
    return json.id ?? null;
  } catch {
    return null;
  }
}

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

/** OHLC candles. CoinGecko picks granularity from the day range. */
export async function fetchOhlc(days: number): Promise<Candle[]> {
  const id = await resolveCoinId();
  if (!id) return [];
  try {
    const res = await fetch(
      `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
      { headers: headers(), next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as [number, number, number, number, number][];
    return rows.map(([t, o, h, l, c]) => ({ t, o, h, l, c }));
  } catch {
    return [];
  }
}

export interface LivePrice {
  price: number | null;
  change24h: number | null;
}

export async function fetchLivePrice(): Promise<LivePrice> {
  try {
    const addr = NSFW_TOKEN_ADDRESS.toLowerCase();
    const res = await fetch(
      `${BASE}/simple/token_price/polygon-pos?contract_addresses=${addr}&vs_currencies=usd&include_24hr_change=true`,
      { headers: headers(), next: { revalidate: 30 } }
    );
    if (!res.ok) return { price: null, change24h: null };
    const data = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;
    const e = data[addr];
    return { price: e?.usd ?? null, change24h: e?.usd_24h_change ?? null };
  } catch {
    return { price: null, change24h: null };
  }
}
