"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "./SubmitButton";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function EmailSignInForm() {
  const [state, formAction] = useFormState(signInAction, initialState);

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
        autoComplete="current-password"
        placeholder="••••••••"
        error={state.fieldErrors?.password}
        required
      />
      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
