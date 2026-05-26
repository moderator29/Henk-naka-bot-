"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Signs a user out after a stretch of inactivity and sends them back to log in,
 * so an unattended session doesn't stay open. Any real interaction (pointer,
 * key, scroll, touch) resets the timer. Mounted only inside the authenticated
 * platform, and only armed when there is a session.
 */
const IDLE_MS = 30 * 60 * 1000; // 30 minutes

export function IdleTimeout({ active = false }: { active?: boolean }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expire = useCallback(() => {
    // Clear the session, then route to login with a notice.
    fetch("/auth/signout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        window.location.href = "/login?timeout=1";
      });
  }, []);

  useEffect(() => {
    if (!active) return;
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(expire, IDLE_MS);
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "visibilitychange"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, expire]);

  return null;
}
