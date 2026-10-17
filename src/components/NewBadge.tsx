export default function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--accent)] ${className}`}
    >
      New
    </span>
  );
}
