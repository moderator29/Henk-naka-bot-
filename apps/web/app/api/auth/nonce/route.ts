import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateNonce, SIWE_NONCE_COOKIE } from "@/lib/auth/siwe";

/**
 * Mints a single-use SIWE nonce, stores it in an httpOnly cookie, and returns
 * it so the client can build the message to sign.
 */
export async function GET() {
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
