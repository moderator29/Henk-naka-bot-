import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Marks notifications read. Body { id } marks one; empty body marks all.
 * RLS restricts updates to the caller's own rows.
 */
export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let id: string | undefined;
  try {
    const body = await req.json();
    id = typeof body?.id === "string" ? body.id : undefined;
  } catch {
    // empty body → mark all
  }

  const supabase = createClient();
  const now = new Date().toISOString();
  let query = supabase.from("notifications").update({ read_at: now }).is("read_at", null);
  if (id) query = query.eq("id", id);

  const { error } = await query;
  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
