import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory, type Timeframe } from "@/lib/market/price-history";

const VALID: Timeframe[] = ["1", "7", "30", "90"];

/** Powers the token chart's timeframe selector (client refetch). */
export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get("days") ?? "7";
  const days = (VALID as string[]).includes(param)
    ? (param as Timeframe)
    : "7";
  const points = await getPriceHistory(days);
  return NextResponse.json(
    { points },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } }
  );
}
