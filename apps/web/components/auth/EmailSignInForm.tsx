"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";
import { Turnstile } from "./Turnstile";
import {
  signInAction,
  magicLinkAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function EmailSignInForm({
  humanVerified = false,
}: {
  humanVerified?: boolean;
}) {
  const [pwState, pwAction] = useFormState(signInAction, initialState);
  const [magicState, magicAction] = useFormState(magicLinkAction, initialState);
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");

  const state = mode === "password" ? pwState : magicState;

  const human = humanVerified ? (
    <p className="flex items-center gap-2 text-sm text-lilac/70">
      <ShieldCheck size={16} className="text-cyan" aria-hidden="true" />
      Verified. You are all set.
    </p>
  ) : (
    <>
      <input type="hidden" name="turnstileToken" value={token} />
      <Turnstile onVerify={setToken} onExpire={() => setToken("")} />
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
        >
          {state.error}
        </p>
      )}
      {state.notice && (
        <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          {state.notice}
        </p>
      )}

      {mode === "password" ? (
        <form action={pwAction} className="flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@example.com"
            error={pwState.fieldErrors?.email}
            required
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-lilac/80">Password</span>
              <Link
                href="/forgot-password"
                className="text-xs text-magenta hover:text-magenta-light"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordField
              name="password"
              autoComplete="current-password"
              placeholder="Your password"
              error={pwState.fieldErrors?.password}
              required
            />
          </div>
          {human}
          <SubmitButton>Sign in</SubmitButton>
        </form>
      ) : (
        <form action={magicAction} className="flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@example.com"
            error={magicState.fieldErrors?.email}
            required
          />
          {human}
          <SubmitButton>Email me a sign-in link</SubmitButton>
        </form>
      )}

      <button
        type="button"
        onClick={() => setMode((m) => (m === "password" ? "magic" : "password"))}
        className="text-sm text-lilac/60 hover:text-white text-center"
      >
        {mode === "password"
          ? "Sign in without a password"
          : "Use a password instead"}
      </button>

      <p className="text-sm text-lilac/70 text-center">
        New here?{" "}
        <Link href="/signup" className="text-magenta hover:text-magenta-light font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
