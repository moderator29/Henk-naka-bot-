"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

/**
 * Submit button that reflects the parent form's pending state via
 * useFormStatus. Must be rendered inside the <form> it submits.
 */
export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full">
      {children}
    </Button>
  );
}
