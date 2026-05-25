import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    await createClient().auth.signOut();
  } catch {
    // Supabase env not configured; nothing to sign out of.
  }
  return NextResponse.redirect(new URL("/", req.url));
}
