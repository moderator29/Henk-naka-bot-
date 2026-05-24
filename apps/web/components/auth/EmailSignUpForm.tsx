"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Check, X, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordField } from "./PasswordField";
import { PasswordStrength } from "./PasswordStrength";
import { SubmitButton } from "./SubmitButton";
import { Turnstile } from "./Turnstile";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";
import { maxDateOfBirthInput, parseDateOfBirth, calculateAge } from "@/lib/auth/age";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};

type UStatus = "idle" | "invalid" | "checking" | "available" | "taken";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function EmailSignUpForm({
  humanVerified = false,
}: {
  humanVerified?: boolean;
}) {
  const [state, formAction] = useFormState(signUpAction, initialState);
  const [token, setToken] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dob, setDob] = useState("");
  const [agree, setAgree] = useState(false);

  const [uStatus, setUStatus] = useState<UStatus>("idle");
  const [uSuggestion, setUSuggestion] = useState<string | undefined>();

  // Live username availability check (debounced).
  useEffect(() => {
    const u = username.trim().toLowerCase();
    if (!u) return setUStatus("idle");
    if (!USERNAME_RE.test(u)) return setUStatus("invalid");
    setUStatus("checking");
    setUSuggestion(undefined);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/username-check?u=${encodeURIComponent(u)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as {
          available: boolean;
          suggestion?: string;
        };
        setUStatus(data.available ? "available" : "taken");
        setUSuggestion(data.suggestion);
      } catch {
        /* aborted or offline; leave as checking */
      }
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [username]);

  const dobDate = parseDateOfBirth(dob);
  const dobAge = dobDate ? calculateAge(dobDate) : null;
  const dobError =
    dob && dobDate && dobAge !== null && dobAge < 18
      ? "You must be 18 or older to join."
      : undefined;
  const confirmError =
    confirm.length > 0 && confirm !== password ? "Passwords do not match" : undefined;
  const passwordOk =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  const formValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    uStatus === "available" &&
    EMAIL_RE.test(email) &&
    passwordOk &&
    confirm === password &&
    !!dobDate &&
    dobAge !== null &&
    dobAge >= 18 &&
    agree &&
    (humanVerified || token.length > 0);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="firstName"
          label="First name"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={state.fieldErrors?.firstName}
          required
        />
        <Input
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={state.fieldErrors?.lastName}
          required
        />
      </div>

      {/* Username with live availability */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-username" className="text-sm font-medium text-lilac/80">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac/40">@</span>
          <input
            id="signup-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            aria-invalid={uStatus === "taken" || uStatus === "invalid"}
            className={cn(
              "h-11 w-full rounded-xl pl-8 pr-11 text-base bg-plum/60 border text-white",
              "placeholder:text-lilac/40 transition-colors duration-150 focus:outline-none focus:ring-2",
              uStatus === "available"
                ? "border-emerald-500/50 focus:ring-emerald-500/20"
                : uStatus === "taken" || uStatus === "invalid"
                  ? "border-red-500/60 focus:ring-red-500/20"
                  : "border-white/10 focus:border-magenta/50 focus:ring-magenta/20"
            )}
            placeholder="yourname"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {uStatus === "checking" && (
              <Loader2 size={16} className="text-lilac/50 animate-spin" />
            )}
            {uStatus === "available" && <Check size={16} className="text-emerald-400" />}
            {(uStatus === "taken" || uStatus === "invalid") && (
              <X size={16} className="text-red-400" />
            )}
          </span>
        </div>
        {uStatus === "invalid" && (
          <span className="text-xs text-red-400">
            3 to 20 characters: letters, numbers, underscores.
          </span>
        )}
        {uStatus === "available" && (
          <span className="text-xs text-emerald-400">Available</span>
        )}
        {uStatus === "taken" && (
          <span className="text-xs text-red-400">
            Taken.{" "}
            {uSuggestion && (
              <button
                type="button"
                onClick={() => setUsername(uSuggestion)}
                className="text-magenta hover:text-magenta-light underline"
              >
                Try @{uSuggestion}
              </button>
            )}
          </span>
        )}
        {state.fieldErrors?.username && (
          <span role="alert" className="text-xs text-red-400">
            {state.fieldErrors.username}
          </span>
        )}
      </div>

      <Input
        name="displayName"
        label="Display name"
        hint="Optional. Defaults to your first name."
        autoComplete="nickname"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder={firstName || "Nickname"}
      />

      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state.fieldErrors?.email}
        required
      />

      <div className="flex flex-col gap-1.5">
        <PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state.fieldErrors?.password}
          required
        />
        <PasswordStrength password={password} />
        <span className="text-xs text-lilac/50">
          8+ characters with an uppercase, a lowercase, and a number.
        </span>
      </div>

      <PasswordField
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirmError ?? state.fieldErrors?.confirmPassword}
        required
      />

      <Input
        name="dateOfBirth"
        type="date"
        label="Date of birth"
        max={maxDateOfBirthInput()}
        hint="You must be 18 or older."
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        error={dobError ?? state.fieldErrors?.dateOfBirth}
        required
      />

      <label className="flex items-start gap-2.5 text-sm text-lilac/80 cursor-pointer">
        <input
          name="ageConfirmed"
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-plum/60 accent-magenta"
          required
        />
        <span>
          I am 18 or older and agree to the{" "}
          <Link href="/legal/terms" className="text-magenta hover:text-magenta-light underline">
            Terms
          </Link>
          .
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

      <SubmitButton disabled={!formValid}>Create account</SubmitButton>

      <p className="text-sm text-lilac/70 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-magenta hover:text-magenta-light font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
