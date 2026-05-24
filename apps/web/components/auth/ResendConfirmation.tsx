"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "./SubmitButton";
import {
  resendConfirmationAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

/** Resend the signup confirmation email to a known address. */
export function ResendConfirmation({ email }: { email: string }) {
  const [state, action] = useFormState(resendConfirmationAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
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
      <SubmitButton>Resend confirmation email</SubmitButton>
    </form>
  );
}
