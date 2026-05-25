import { NextResponse } from "next/server";
import { POLYGON_CHAIN_ID, swapFeeBps, treasuryWallet } from "@/lib/trade/config";

/**
 * 0x Swap API v2 (allowance-holder) quote proxy. Keeps ZEROX_API_KEY server
 * side, attaches the platform affiliate fee to the treasury wallet, and returns
 * the executable transaction for the client to send via wagmi. Returns 503 with
 * a clear message until ZEROX_API_KEY is set, never a fake quote.
 */
export async function GET(req: Request) {
  const key = process.env.ZEROX_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, pending: true, error: "Trading activates once the swap API key is set." },
      { status: 503 }
    );
  }

  const sp = new URL(req.url).searchParams;
  const sellToken = sp.get("sellToken");
  const buyToken = sp.get("buyToken");
  const sellAmount = sp.get("sellAmount");
  const taker = sp.get("taker");
  if (!sellToken || !buyToken || !sellAmount || !taker) {
    return NextResponse.json({ ok: false, error: "Missing parameters." }, { status: 400 });
  }

  const params = new URLSearchParams({
    chainId: String(POLYGON_CHAIN_ID),
    sellToken,
    buyToken,
    sellAmount,
    taker,
  });
  const slippageBps = sp.get("slippageBps");
  if (slippageBps) params.set("slippageBps", slippageBps);

  const treasury = treasuryWallet();
  if (treasury) {
    params.set("swapFeeRecipient", treasury);
    params.set("swapFeeBps", String(swapFeeBps()));
    params.set("swapFeeToken", buyToken);
  }

  try {
    const res = await fetch(
      `https://api.0x.org/swap/allowance-holder/quote?${params.toString()}`,
      { headers: { "0x-api-key": key, "0x-version": "v2" } }
    );
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: data?.reason ?? "Could not fetch a quote." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, quote: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not reach the swap service." },
      { status: 502 }
    );
  }
}
