"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, LinkIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import ExternalCourseCard, { type ExternalCourse } from "@/components/ExternalCourseCard";
import EXTERNAL_COURSES from "@/data/externalCourses.json";

const PER_PAGE = 18;

export default function PlatformsPage() {
  const courses = EXTERNAL_COURSES as ExternalCourse[];
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(courses.length / PER_PAGE));
  const visible = courses.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function goTo(p: number) {
    setPage(Math.min(Math.max(1, p), pageCount));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
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

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => (
          <ExternalCourseCard key={c.id} course={c} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--muted)]"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                p === page
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === pageCount}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--muted)]"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
