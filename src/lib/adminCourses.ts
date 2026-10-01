import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Course, CourseItem, CourseSection, CourseSubstep } from "@/types/course";

export async function assembleCourses(courseIds?: string[]): Promise<Course[]> {
  const supabase = getSupabaseAdmin();

  let courseQuery = supabase.from("admin_courses").select("*").order("created_at", { ascending: true });
  if (courseIds) courseQuery = courseQuery.in("id", courseIds);
  const { data: courseRows, error: courseErr } = await courseQuery;
  if (courseErr) throw new Error(courseErr.message);
  if (!courseRows.length) return [];

  const ids = courseRows.map((c) => c.id);
  const { data: sectionRows, error: sectionErr } = await supabase
    .from("admin_course_sections")
    .select("*")
    .in("course_id", ids)
    .order("sort_order", { ascending: true });
  if (sectionErr) throw new Error(sectionErr.message);

  const sectionIds = sectionRows.map((s) => s.id);
  const { data: itemRows, error: itemErr } = sectionIds.length
    ? await supabase
        .from("admin_course_items")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order", { ascending: true })
    : { data: [] as never[], error: null };
  if (itemErr) throw new Error(itemErr.message);

  const itemIds = itemRows.map((i) => i.id);
  const { data: substepRows, error: substepErr } = itemIds.length
    ? await supabase
        .from("admin_course_substeps")
        .select("*")
        .in("item_id", itemIds)
        .order("sort_order", { ascending: true })
    : { data: [] as never[], error: null };
  if (substepErr) throw new Error(substepErr.message);

  const substepsByItem = new Map<string, CourseSubstep[]>();
  substepRows.forEach((row) => {
    const list = substepsByItem.get(row.item_id) || [];
    list.push({
      id: row.id,
      label: row.label,
      whatYouLearn: row.what_you_learn,
      resourceType: row.resource_type,
      resourceUrl: row.resource_url,
      prompt: row.prompt,
    });
    substepsByItem.set(row.item_id, list);
  });

  const itemsBySection = new Map<string, CourseItem[]>();
  itemRows.forEach((row) => {
    const list = itemsBySection.get(row.section_id) || [];
    list.push({
      id: row.id,
      title: row.title,
      wholePrompt: row.whole_prompt,
      substeps: substepsByItem.get(row.id) || [],
    });
    itemsBySection.set(row.section_id, list);
  });

  const sectionsByCourse = new Map<string, CourseSection[]>();
  sectionRows.forEach((row) => {
    const list = sectionsByCourse.get(row.course_id) || [];
    list.push({
      id: row.id,
      title: row.title,
      note: row.note || undefined,
      priority: row.priority,
      track: row.track,
      customItems: itemsBySection.get(row.id) || [],
    });
    sectionsByCourse.set(row.course_id, list);
  });

  return courseRows.map((c) => ({
    slug: c.id,
    title: c.title,
    subtitle: c.subtitle,
    roleKeys: c.role_keys || [],
    sections: sectionsByCourse.get(c.id) || [],
    isCustom: true,
    createdBy: c.created_by || undefined,
    createdAt: c.created_at,
  }));
}

export async function getAdminCourseBySlug(slug: string): Promise<Course | undefined> {
  const courses = await assembleCourses([slug]);
  return courses[0];
}
