export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-1" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs uppercase tracking-wider text-lilac/40">
        {label}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
