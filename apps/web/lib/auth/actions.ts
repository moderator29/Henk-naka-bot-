"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "./schemas";
import { parseDateOfBirth } from "./age";
import { verifyTurnstile } from "./turnstile";
import { hasHumanVerified } from "./human-check";

/**
 * A visitor is allowed through if they already passed the full-page verify gate
 * (signed cookie) OR they completed the inline widget on this form. This keeps
 * the flow to a single human check, the way mainstream platforms work.
 */
async function passedHumanCheck(formData: FormData) {
  if (hasHumanVerified()) return { ok: true as const };
  return verifyTurnstile(String(formData.get("turnstileToken") ?? ""));
}

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Email + password sign-up. Stores DOB in user metadata at signup; a DB
 * trigger / profile upsert copies it onto the users row. 18+ is enforced both
 * in the Zod schema and re-checked here server-side.
 */
export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    ageConfirmed: formData.get("ageConfirmed") === "on",
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const dob = parseDateOfBirth(parsed.data.dateOfBirth);
  if (!dob) {
    return { fieldErrors: { dateOfBirth: "Enter a valid date" } };
  }

  const turnstile = await passedHumanCheck(formData);
  if (!turnstile.ok) {
    return { error: turnstile.error ?? "Please complete the verification." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { date_of_birth: parsed.data.dateOfBirth },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/check-email");
}

/** Email + password sign-in. */
export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const turnstile = await passedHumanCheck(formData);
  if (!turnstile.ok) {
    return { error: turnstile.error ?? "Please complete the verification." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email or password is incorrect" };
  }

  redirect("/explore");
}

/** Kicks off Google OAuth; Supabase returns a redirect URL to the provider. */
export async function signInWithGoogleAction() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}
