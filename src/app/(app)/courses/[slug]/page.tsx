import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourse } from "@/data/courses";
import { getAdminCourseBySlug } from "@/lib/adminCourses";
import CourseChecklist from "@/components/CourseChecklist";
import { ArrowLeftIcon } from "@/components/icons";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug) || (await getAdminCourseBySlug(slug));
  if (!course) notFound();

  return (
    <div>
      <div className="mx-auto max-w-5xl px-5 pt-6 md:px-8">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Courses
        </Link>
      </div>
      <CourseChecklist course={course} />
    </div>
  );
}
