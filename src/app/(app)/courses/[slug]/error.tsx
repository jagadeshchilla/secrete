"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function CourseDetailError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Courses
      </Link>
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <h1 className="text-base font-semibold">Couldn&apos;t load this course</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Something went wrong talking to the database. Try again, or head back to the course list.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
