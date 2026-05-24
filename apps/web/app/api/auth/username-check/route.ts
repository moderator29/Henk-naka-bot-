import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/auth/schemas";

/**
 * Live username availability. Validates the format, then checks the users
 * table (public read). When taken, returns a suggested variant that is itself
 * free. Used by the sign-up form for the green check / red message.
 */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  const parsed = usernameSchema.safeParse(u);
  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      reason: parsed.error.issues[0]?.message ?? "Invalid username",
    });
  }
  const username = parsed.data;

  let supabase;
  try {
    supabase = createClient();
  } catch {
    // Supabase not configured in this environment; don't block the form.
    return NextResponse.json({ available: true, unverified: true });
  }

  const { data: taken } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!taken) {
    return NextResponse.json({ available: true });
  }

  // Find a free suggestion.
  let suggestion: string | undefined;
  for (let i = 0; i < 5; i++) {
    const candidate = `${username}${Math.floor(10 + Math.random() * 990)}`.slice(0, 20);
    const { data: hit } = await supabase
      .from("users")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();
    if (!hit) {
      suggestion = candidate;
      break;
    }
  }

  return NextResponse.json({ available: false, suggestion });
}
