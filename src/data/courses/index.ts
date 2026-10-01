import type { Course } from "@/types/course";

export const COURSES: Course[] = [];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
