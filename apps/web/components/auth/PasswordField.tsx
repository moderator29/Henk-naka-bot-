"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Password input with a show/hide toggle, matching the Input field styling. */
export function PasswordField({
  className,
  label,
  error,
  hint,
  id,
  ...props
}: PasswordFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const [show, setShow] = useState(false);
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-lilac/80">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "h-11 w-full rounded-xl pl-4 pr-11 text-base",
            "bg-plum/60 border border-white/10 text-white",
            "placeholder:text-lilac/40 transition-colors duration-150",
            "focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20",
            error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-lg text-lilac/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {hint && !error && (
        <span id={hintId} className="text-xs text-lilac/50">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
