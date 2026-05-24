import { Sparkles, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const points = [
  {
    icon: Sparkles,
    title: "One home for everything",
    body: "Feed, discovery, creators, marketplace, staking, and the token, together.",
  },
  {
    icon: Wallet,
    title: "Powered by $NSFW",
    body: "Buy once, use everywhere across the whole ecosystem.",
  },
  {
    icon: ShieldCheck,
    title: "Private and secure",
    body: "You control your data. Strictly 18+, verified at the door.",
  },
];

/**
 * The calm branded half of the two-pane auth layout (desktop only). The logo
 * lockup sits in generous space so it is never clipped, with a short value
 * line and a few quiet proof points.
 */
export function AuthBrandPanel() {
  return (
    <aside className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
      <Logo size="lg" />

      <div className="max-w-md">
        <h2 className="font-display text-3xl xl:text-4xl font-bold text-white leading-tight">
          The unified home for{" "}
          <span className="text-gradient inline-block pb-[0.08em]">
            adult creators
          </span>
          .
        </h2>
        <ul className="mt-10 flex flex-col gap-6">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="h-10 w-10 shrink-0 rounded-xl glass edge-light flex items-center justify-center text-magenta">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-lilac/65">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-faint">Pleasure Coin · Powered by $NSFW</p>
    </aside>
  );
}
