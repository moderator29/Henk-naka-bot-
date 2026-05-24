"use client";

import { useState } from "react";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { changePassword } from "@/lib/profile/actions";
import { Section } from "./AccountSettings";

export function PasswordSettings() {
  const { push } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const confirmError = confirm.length > 0 && confirm !== next ? "Passwords do not match" : undefined;

  async function save() {
    setSaving(true);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.set("currentPassword", current);
      fd.set("newPassword", next);
      fd.set("confirmPassword", confirm);
      const res = await changePassword(fd);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) push({ tone: "error", title: res.error });
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      push({ tone: "success", title: "Password updated" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Password" desc="Change your password. We confirm your current one first.">
      <PasswordField
        label="Current password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        error={fieldErrors.currentPassword}
      />
      <div className="flex flex-col gap-1.5">
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={fieldErrors.newPassword}
        />
        <PasswordStrength password={next} />
      </div>
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirmError ?? fieldErrors.confirmPassword}
      />
      <div className="flex justify-end">
        <Button loading={saving} disabled={!current || !next || next !== confirm} onClick={save}>
          Update password
        </Button>
      </div>
    </Section>
  );
}
