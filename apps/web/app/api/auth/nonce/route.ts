import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateNonce, SIWE_NONCE_COOKIE } from "@/lib/auth/siwe";
import { rateLimit, clientIp } from "@/lib/security/ratelimit";

/**
 * Mints a single-use SIWE nonce, stores it in an httpOnly cookie, and returns
 * it so the client can build the message to sign. Rate-limited per IP to blunt
 * nonce-minting abuse.
 */
export async function GET(req: NextRequest) {
  const ok = await rateLimit("nonce", clientIp(req.headers), 30, "1 m");
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const nonce = generateNonce();

  cookies().set(SIWE_NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.json({ nonce });
}
