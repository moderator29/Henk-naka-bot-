"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "./SubmitButton";
import { forgotPasswordAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, action] = useFormState(forgotPasswordAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.notice && (
        <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          {state.notice}
        </p>
      )}
      {state.error && (
        <p
          role="alert"
          className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
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
      <SubmitButton>Send reset link</SubmitButton>
      <p className="text-sm text-lilac/70 text-center">
        Remembered it?{" "}
        <Link href="/login" className="text-magenta hover:text-magenta-light font-medium">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
