import { ExternalLinkIcon, LockIcon } from "@/components/icons";
import Favicon from "@/components/Favicon";

export interface SpecialCourse {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  whatYouLearn: string;
  accessNote: string; // e.g. "Shared Udemy account, login: x@y.com — message me for the OTP/password"
}

export default function SpecialCourseCard({ course }: { course: SpecialCourse }) {
  const topics = course.whatYouLearn
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noreferrer"
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:border-[var(--accent)]"
    >
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
          <span className="shrink-0 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--accent)]">
            Paid
          </span>
        </div>

        {course.description && (
          <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{course.description}</p>
        )}

        {topics.length > 0 && (
          <div className="mt-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              What&apos;s included ({topics.length})
            </p>
            <ul className="mt-1.5 max-h-28 space-y-1 overflow-y-auto pr-1">
              {topics.map((t, i) => (
                <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-[var(--text)]">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-[var(--muted)]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.accessNote && (
          <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
            <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">{course.accessNote}</p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
          Visit site
          <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  );
}
