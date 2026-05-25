import type { ReactNode } from "react";

/** Shared layout for legal pages: readable prose over the ambient aurora. */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-faint">Last updated {updated}</p>
        <div className="mt-10 flex flex-col gap-6 text-lilac/80 leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
