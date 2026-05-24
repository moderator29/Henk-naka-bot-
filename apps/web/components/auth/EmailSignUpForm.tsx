"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "./SubmitButton";
import { Turnstile } from "./Turnstile";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";
import { maxDateOfBirthInput } from "@/lib/auth/age";

const initialState: AuthActionState = {};

/**
 * `humanVerified` is true when the visitor already cleared the full-page verify
 * gate (signed cookie). In that case we show a quiet confirmation instead of a
 * second Turnstile challenge.
 */
export function EmailSignUpForm({
  humanVerified = false,
}: {
  humanVerified?: boolean;
}) {
  const [state, formAction] = useFormState(signUpAction, initialState);
  const [token, setToken] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
        error={state.fieldErrors?.email}
        required
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="8+ chars with upper, lower, and a number"
        error={state.fieldErrors?.password}
        required
      />
      <Input
        name="dateOfBirth"
        type="date"
        label="Date of birth"
        max={maxDateOfBirthInput()}
        hint="You must be 18 or older"
        error={state.fieldErrors?.dateOfBirth}
        required
      />
      <label className="flex items-start gap-2.5 text-sm text-lilac/80 cursor-pointer">
        <input
          name="ageConfirmed"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-plum/60 accent-magenta"
          required
        />
        <span>
          I confirm I am 18 years of age or older.
          {state.fieldErrors?.ageConfirmed && (
            <span role="alert" className="block text-xs text-red-400 mt-1">
              {state.fieldErrors.ageConfirmed}
            </span>
          )}
        </span>
      </label>

      {humanVerified ? (
        <p className="flex items-center gap-2 text-sm text-lilac/70">
          <ShieldCheck size={16} className="text-cyan" aria-hidden="true" />
          Verified. You are all set.
        </p>
      ) : (
        <>
          <input type="hidden" name="turnstileToken" value={token} />
          <Turnstile onVerify={setToken} onExpire={() => setToken("")} />
        </>
      )}

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
