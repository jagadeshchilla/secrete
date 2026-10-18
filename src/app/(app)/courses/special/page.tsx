"use client";

import Link from "next/link";
import { ArrowLeftIcon, AwardIcon } from "@/components/icons";
import SpecialCourseCard, { type SpecialCourse } from "@/components/SpecialCourseCard";
import SPECIAL_COURSES from "@/data/specialCourses.json";

export default function SpecialCoursesPage() {
  const courses = SPECIAL_COURSES as SpecialCourse[];

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
        <AwardIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Special courses</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        😊 These are paid courses I already have — I&apos;m giving them to you, and I&apos;d be so happy if they turn
        out to be useful.
      </p>

      {courses.length === 0 ? (
        <div className="mt-6 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          No special courses added yet.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <SpecialCourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
