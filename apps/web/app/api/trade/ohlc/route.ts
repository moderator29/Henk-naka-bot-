import { NextResponse } from "next/server";
import { fetchOhlc } from "@/lib/market/coingecko";

const ALLOWED = new Set([1, 7, 30, 90]);

export async function GET(req: Request) {
  const raw = Number(new URL(req.url).searchParams.get("days") ?? 1);
  const days = ALLOWED.has(raw) ? raw : 1;
  const candles = await fetchOhlc(days);
  return NextResponse.json({ days, candles });
}
