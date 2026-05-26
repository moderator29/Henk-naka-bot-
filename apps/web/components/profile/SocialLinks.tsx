import { cn } from "@/lib/utils";

/**
 * Telegram and X (Twitter) profile buttons. Renders nothing when a user has
 * set neither. Links open in a new tab with rel="noopener noreferrer". Icons
 * are inline brand glyphs so we don't depend on deprecated icon-set entries.
 */
export function SocialLinks({
  telegramUrl,
  xUrl,
  className,
}: {
  telegramUrl?: string | null;
  xUrl?: string | null;
  className?: string;
}) {
  if (!telegramUrl && !xUrl) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {telegramUrl && (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram profile (opens in a new tab)"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl glass text-sm text-lilac hover:text-white hover:border-magenta/40 transition-colors"
        >
          <TelegramGlyph />
          Telegram
        </a>
      )}
      {xUrl && (
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X profile (opens in a new tab)"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl glass text-sm text-lilac hover:text-white hover:border-magenta/40 transition-colors"
        >
          <XGlyph />X
        </a>
      )}
    </div>
  );
}

function TelegramGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.94 4.6 18.6 20.36c-.25 1.11-.91 1.38-1.84.86l-5.1-3.76-2.46 2.37c-.27.27-.5.5-1.03.5l.37-5.2L17.97 6.3c.41-.37-.09-.57-.64-.2L5.9 13.36l-5.06-1.58c-1.1-.34-1.12-1.1.23-1.63L20.5 2.94c.92-.34 1.72.2 1.44 1.66Z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}
