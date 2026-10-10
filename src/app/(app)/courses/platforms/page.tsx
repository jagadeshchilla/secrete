import Link from "next/link";
import { ArrowLeftIcon, LinkIcon } from "@/components/icons";
import ExternalCourseCard, { type ExternalCourse } from "@/components/ExternalCourseCard";
import EXTERNAL_COURSES from "@/data/externalCourses.json";

export default function PlatformsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Courses
      </Link>

      <div className="animate-fade-in-up mt-4 flex items-center gap-2">
        <LinkIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Important courses &amp; platforms</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Outside websites/platforms worth knowing about — not checklists with progress tracking, just what
        they are, what you&apos;ll learn there, and why they&apos;re worth your time.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(EXTERNAL_COURSES as ExternalCourse[]).map((c) => (
          <ExternalCourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
