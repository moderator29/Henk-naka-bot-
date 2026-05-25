"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  emailOnlySchema,
  passwordSchema,
} from "./schemas";
import { parseDateOfBirth } from "./age";
import { verifyTurnstile } from "./turnstile";
import { hasHumanVerified } from "./human-check";

export interface AuthActionState {
  error?: string;
  notice?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * A visitor is allowed through if they already passed the full-page verify gate
 * (signed cookie) OR they completed the inline widget on this form. This keeps
 * the flow to a single human check, the way mainstream platforms work.
 */
async function passedHumanCheck(formData: FormData) {
  if (hasHumanVerified()) return { ok: true as const };
  return verifyTurnstile(String(formData.get("turnstileToken") ?? ""));
}

function fieldErrorsFrom(
  issues: readonly { path: PropertyKey[]; message: string }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

/**
 * Email + password sign-up. Captures first/last name, username, display name,
 * and DOB into auth metadata; a security-definer trigger mirrors them onto the
 * users row. 18+ is enforced in the schema and re-checked here.
 */
export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    username: String(formData.get("username") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    ageConfirmed: formData.get("ageConfirmed") === "on",
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  if (!parseDateOfBirth(parsed.data.dateOfBirth)) {
    return { fieldErrors: { dateOfBirth: "Enter a valid date" } };
  }

  const human = await passedHumanCheck(formData);
  if (!human.ok) {
    return { error: human.error ?? "Please complete the verification." };
  }

  const supabase = createClient();

  // Username uniqueness pre-check (the DB unique constraint is the backstop).
  const { data: taken } = await supabase
    .from("users")
    .select("id")
    .eq("username", parsed.data.username)
    .maybeSingle();
  if (taken) {
    return { fieldErrors: { username: "That username is taken" } };
  }

  const displayName =
    parsed.data.displayName && parsed.data.displayName.trim().length > 0
      ? parsed.data.displayName.trim()
      : parsed.data.firstName;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        username: parsed.data.username,
        display_name: displayName,
        date_of_birth: parsed.data.dateOfBirth,
      },
      emailRedirectTo: `${APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      return {
        fieldErrors: {
          email: "An account with this email already exists. Try signing in.",
        },
      };
    }
    return { error: "Something went wrong creating your account. Try again." };
  }

  // Anti-enumeration: Supabase returns a user with no identities when the email
  // is already in use. Treat that as "already registered" gracefully.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      fieldErrors: {
        email: "An account with this email already exists. Try signing in.",
      },
    };
  }

  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}`);
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
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const human = await passedHumanCheck(formData);
  if (!human.ok) {
    return { error: human.error ?? "Please complete the verification." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (/email not confirmed/i.test(error.message)) {
      return {
        error: "Please confirm your email first. Check your inbox for the link.",
      };
    }
    return { error: "Email or password is incorrect." };
  }

  const next = String(formData.get("next") ?? "");
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/feed";
  redirect(dest);
}

/** Passwordless sign-in via Supabase magic link. */
export async function magicLinkAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailOnlySchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const human = await passedHumanCheck(formData);
  if (!human.ok) {
    return { error: human.error ?? "Please complete the verification." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${APP_URL}/auth/callback` },
  });
  if (error) {
    return { error: "Could not send the link. Try again in a moment." };
  }
  return { notice: "Check your email for a sign-in link." };
}

/** Sends a password-reset email. */
export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailOnlySchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const human = await passedHumanCheck(formData);
  if (!human.ok) {
    return { error: human.error ?? "Please complete the verification." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${APP_URL}/auth/callback?next=/reset-password` }
  );
  // Always report success to avoid leaking which emails exist.
  if (error) {
    return {
      notice:
        "If an account exists for that email, a reset link is on its way.",
    };
  }
  return {
    notice: "If an account exists for that email, a reset link is on its way.",
  };
}

/** Sets a new password (requires the recovery session from the email link). */
export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { fieldErrors: { password: parsed.error.issues[0]?.message ?? "Invalid" } };
  }
  if (password !== confirm) {
    return { fieldErrors: { confirmPassword: "Passwords do not match" } };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      error:
        "Your reset link may have expired. Request a new one and try again.",
    };
  }
  redirect("/explore");
}

/** Resends the signup confirmation email. */
export async function resendConfirmationAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailOnlySchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${APP_URL}/auth/callback` },
  });
  if (error) {
    return { error: "Could not resend right now. Try again shortly." };
  }
  return { notice: "Sent. Check your inbox for the confirmation link." };
}
