"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { signOutEverywhere } from "@/lib/profile/actions";

export function SignOutEverywhere() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="glass"
      size="sm"
      loading={busy}
      leftIcon={<LogOut size={14} />}
      onClick={() => {
        setBusy(true);
        void signOutEverywhere();
      }}
    >
      Sign out everywhere
    </Button>
  );
}
