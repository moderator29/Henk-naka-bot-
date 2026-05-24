"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { PasswordField } from "./PasswordField";
import { PasswordStrength } from "./PasswordStrength";
import { SubmitButton } from "./SubmitButton";
import { resetPasswordAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, action] = useFormState(resetPasswordAction, initialState);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordOk =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);
  const confirmError =
    confirm.length > 0 && confirm !== password ? "Passwords do not match" : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
        >
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <PasswordField
          name="password"
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state.fieldErrors?.password}
          required
        />
        <PasswordStrength password={password} />
      </div>
      <PasswordField
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirmError ?? state.fieldErrors?.confirmPassword}
        required
      />
      <SubmitButton disabled={!passwordOk || password !== confirm}>
        Set new password
      </SubmitButton>
    </form>
  );
}
