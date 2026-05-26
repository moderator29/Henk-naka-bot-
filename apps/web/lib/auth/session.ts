import { createClient } from "@/lib/supabase/server";
import { isAdult } from "./age";

/**
 * Server-side session helpers. Used by Server Components and route handlers to
 * read the current user and enforce the 18+ gate on sensitive surfaces
 * (RPD §9.1, "checked on every sensitive action").
 */

export interface SessionUser {
  id: string;
  email: string | null;
  dateOfBirth: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const dob =
      (user.user_metadata?.date_of_birth as string | undefined) ?? null;

    return {
      id: user.id,
      email: user.email ?? null,
      dateOfBirth: dob,
    };
  } catch {
    // Never let a transient client/session error blank a whole route; callers
    // treat null as "signed out" and render the appropriate state.
    return null;
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

export class AgeRestrictedError extends Error {
  constructor() {
    super("This action requires a verified adult account (18+).");
    this.name = "AgeRestrictedError";
  }
}

/**
 * Guards a sensitive action. Throws if the requester isn't signed in or
 * isn't a verified adult. Call at the top of any server action / route
 * handler that exposes gated content.
 */
export async function requireAdult(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new NotAuthenticatedError();
  if (!user.dateOfBirth || !isAdult(new Date(user.dateOfBirth))) {
    throw new AgeRestrictedError();
  }
  return user;
}
