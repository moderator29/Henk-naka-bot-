"use client";

const SECTIONS: { id: string; label: string }[] = [
  { id: "edit-profile", label: "Edit profile" },
  { id: "account", label: "Account" },
  { id: "privacy", label: "Privacy" },
  { id: "notifications", label: "Notifications & AI" },
  { id: "monetization", label: "Subscriptions" },
  { id: "creator", label: "Creator" },
  { id: "wallet", label: "Wallet & security" },
  { id: "safety", label: "Content & safety" },
  { id: "password", label: "Password" },
  { id: "help", label: "Help" },
  { id: "legal", label: "Legal" },
  { id: "danger", label: "Danger zone" },
];

/** Sticky in-page section nav for the settings hub (desktop). */
export function SectionNav() {
  return (
    <nav
      aria-label="Settings sections"
      className="hidden lg:block sticky top-20 self-start w-48 flex-shrink-0"
    >
      <ul className="flex flex-col gap-0.5">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block px-3 py-1.5 rounded-lg text-sm text-lilac/65 hover:text-white hover:bg-white/5 transition-colors"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
