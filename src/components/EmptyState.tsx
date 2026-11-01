// Shared empty-state treatment for list/data pages (Ideas, Research,
// Freelancing, Certifications, Roadmap, Mock Interview, Special Courses) —
// replaces bare dashed-border text with an icon badge + message, consistent
// with the rest of the app's premium surface styling.
export default function EmptyState({
  icon: Icon,
  message,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`animate-fade-in-up flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 px-6 py-12 text-center ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="max-w-xs text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}
