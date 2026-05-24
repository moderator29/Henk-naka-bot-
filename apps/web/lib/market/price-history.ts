import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";

/**
 * Historical $NSFW price series for the token chart, from CoinGecko's
 * market_chart endpoint (by contract on Polygon). Real integration, returns
 * an empty array when the provider is unavailable so the chart shows an
 * honest "unavailable" state rather than fabricated candles.
 */

export interface PricePoint {
  t: number; // unix ms
  price: number;
}

export type Timeframe = "1" | "7" | "30" | "90";

export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "1", label: "24H" },
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
];

export async function getPriceHistory(
  days: Timeframe = "7"
): Promise<PricePoint[]> {
  try {
    const addr = NSFW_TOKEN_ADDRESS.toLowerCase();
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/polygon-pos/contract/${addr}/market_chart?vs_currency=usd&days=${days}`,
      {
        headers: process.env.COINGECKO_API_KEY
          ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
          : {},
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { prices?: [number, number][] };
    if (!json.prices) return [];
    return json.prices.map(([t, price]) => ({ t, price }));
  } catch {
    return [];
  }
}
