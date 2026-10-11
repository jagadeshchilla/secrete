import { AwardIcon } from "@/components/icons";

export default function CertificationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <AwardIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Certifications</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">Track certifications you&apos;re pursuing or have earned.</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--border)] py-20 text-center">
        <AwardIcon className="h-8 w-8 text-[var(--muted)]" />
        <p className="text-sm font-medium text-[var(--muted)]">Coming soon</p>
      </div>
    </div>
  );
}
