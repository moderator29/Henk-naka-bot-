import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";
import { getHolderCount } from "./holders";

/**
 * Live $NSFW market data. CoinGecko is primary; CoinMarketCap is the fallback.
 *
 * Per Rule 8 (real integrations, no fake data): every field is null when the
 * providers don't return it. The UI renders a dash for null metrics, it never
 * invents a number. Holders count is null until an explorer integration lands
 * (CoinGecko's simple endpoint doesn't expose it).
 */

export interface TokenStats {
  price: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  holders: number | null;
}

const EMPTY: TokenStats = {
  price: null,
  change24h: null,
  marketCap: null,
  volume24h: null,
  holders: null,
};

export async function getTokenStats(): Promise<TokenStats> {
  const [base, holders] = await Promise.all([resolveBase(), getHolderCount()]);
  return { ...base, holders };
}

async function resolveBase(): Promise<TokenStats> {
  const cg = await fromCoinGecko();
  if (cg && cg.price != null) return cg;

  const cmc = await fromCoinMarketCap();
  if (cmc && cmc.price != null) return cmc;

  return EMPTY;
}

async function fromCoinGecko(): Promise<TokenStats | null> {
  try {
    const addr = NSFW_TOKEN_ADDRESS.toLowerCase();
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${addr}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
      {
        headers: process.env.COINGECKO_API_KEY
          ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
          : {},
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<
      string,
      {
        usd?: number;
        usd_24h_change?: number;
        usd_market_cap?: number;
        usd_24h_vol?: number;
      }
    >;
    const entry = data[NSFW_TOKEN_ADDRESS.toLowerCase()];
    if (!entry) return null;
    return {
      price: entry.usd ?? null,
      change24h: entry.usd_24h_change ?? null,
      marketCap: entry.usd_market_cap ?? null,
      volume24h: entry.usd_24h_vol ?? null,
      holders: null,
    };
  } catch {
    return null;
  }
}

async function fromCoinMarketCap(): Promise<TokenStats | null> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  const cmcId = process.env.CMC_NSFW_ID;
  // CMC quotes need an API key + the token's CMC id. Without both we can't
  // resolve $NSFW reliably (symbol lookups are ambiguous), so we bail to null
  // rather than guess.
  if (!apiKey || !cmcId) return null;

  try {
    const res = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${cmcId}`,
      {
        headers: { "X-CMC_PRO_API_KEY": apiKey },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: Record<
        string,
        { quote?: { USD?: { price?: number; percent_change_24h?: number; market_cap?: number; volume_24h?: number } } }
      >;
    };
    const quote = json.data?.[cmcId]?.quote?.USD;
    if (!quote) return null;
    return {
      price: quote.price ?? null,
      change24h: quote.percent_change_24h ?? null,
      marketCap: quote.market_cap ?? null,
      volume24h: quote.volume_24h ?? null,
      holders: null,
    };
  } catch {
    return null;
  }
}
