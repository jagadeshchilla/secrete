import { ExternalLinkIcon } from "@/components/icons";
import Favicon from "@/components/Favicon";

export interface ExternalCourse {
  id: string;
  title: string;
  url: string;
  pricing: "free" | "paid" | "freemium";
  category: string;
  description: string;
  whatYouLearn: string;
  whyImportant: string;
}

const PRICING_LABELS: Record<ExternalCourse["pricing"], string> = {
  free: "Free",
  paid: "Paid",
  freemium: "Free + Paid tiers",
};

const PRICING_COLORS: Record<ExternalCourse["pricing"], string> = {
  free: "var(--good)",
  paid: "var(--accent)",
  freemium: "#a78bfa",
};

export default function ExternalCourseCard({ course }: { course: ExternalCourse }) {
  const color = PRICING_COLORS[course.pricing];

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noreferrer"
      className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:border-[var(--accent)]"
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
              <Favicon url={course.url} className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-snug">{course.title}</h3>
              <p className="truncate text-[10px] text-[var(--muted)]">{course.category}</p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ borderColor: color, color }}
          >
            {PRICING_LABELS[course.pricing]}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{course.description}</p>

        <div className="mt-2 space-y-2 rounded-lg bg-[var(--surface-2)] p-2.5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              What you&apos;ll learn
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed">{course.whatYouLearn}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Why it matters
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{course.whyImportant}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
          Visit site
          <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  );
}
