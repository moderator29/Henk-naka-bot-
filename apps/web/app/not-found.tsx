import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100svh] grid place-items-center bg-plum px-4 text-center">
      <div className="glass edge-light rounded-3xl p-8 max-w-md">
        <p className="font-display text-5xl font-bold text-gradient">404</p>
        <h1 className="mt-3 font-display text-xl font-semibold text-white">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-lilac/70">
          The link may be broken or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center h-11 px-5 rounded-pill btn-primary text-white text-sm font-semibold"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
