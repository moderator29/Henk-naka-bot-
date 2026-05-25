"use client";

import Link from "next/link";

/**
 * Route-level error boundary. Catches render/runtime errors in any route group
 * and shows an on-brand recovery screen instead of a raw stack trace.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[100svh] grid place-items-center bg-plum px-4 text-center">
      <div className="glass edge-light rounded-3xl p-8 max-w-md">
        <h1 className="font-display text-2xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-lilac/70">
          That page hit a snag. Try again, or head back home.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="h-11 px-5 rounded-pill btn-primary text-white text-sm font-semibold"
          >
            Try again
          </button>
          <Link
            href="/"
            className="h-11 px-5 rounded-pill glass text-white text-sm font-semibold inline-flex items-center"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
