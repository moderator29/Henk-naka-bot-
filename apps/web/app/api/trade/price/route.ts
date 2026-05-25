import { NextResponse } from "next/server";
import { fetchLivePrice } from "@/lib/market/coingecko";

export async function GET() {
  return NextResponse.json(await fetchLivePrice());
}
