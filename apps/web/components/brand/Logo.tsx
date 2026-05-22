import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string | null;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { mark: 24, text: "text-base" },
  md: { mark: 32, text: "text-lg" },
  lg: { mark: 48, text: "text-2xl" },
} as const;

/**
 * Pleasure Coin mark — faceted diamond with magenta-to-cyan gradient.
 * Used in marketing nav, platform sidebar, and footer.
 */
export function Logo({
  className,
  href = "/",
  showWordmark = true,
  size = "md",
}: LogoProps) {
  const { mark, text } = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DiamondMark size={mark} />
      {showWordmark && (
        <span className={cn("font-display font-bold tracking-tight", text)}>
          Pleasure<span className="text-gradient">Coin</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Pleasure Coin home">
        {content}
      </Link>
    );
  }
  return content;
}

function DiamondMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="diamond-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#FF1F8F" />
          <stop offset="60%" stopColor="#B847FF" />
          <stop offset="100%" stopColor="#5DD6FF" />
        </linearGradient>
        <filter id="diamond-glow">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <path
        d="M16 2 L28 12 L16 30 L4 12 Z"
        fill="url(#diamond-grad)"
        filter="url(#diamond-glow)"
        opacity="0.5"
      />
      <path d="M16 2 L28 12 L16 30 L4 12 Z" fill="url(#diamond-grad)" />
      <path
        d="M16 2 L28 12 L16 30 L4 12 Z M4 12 L28 12 M16 2 L16 30"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
