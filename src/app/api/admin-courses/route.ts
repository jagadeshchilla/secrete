import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { assembleCourses } from "@/lib/adminCourses";
import { COURSES } from "@/data/courses";
import type { Course } from "@/types/course";

const STATIC_SLUGS = new Set(COURSES.map((c) => c.slug));

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "course"
  );
}

function errorResponse(e: unknown) {
  return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
}

export async function GET() {
  try {
    const courses = await assembleCourses();
    return NextResponse.json({ courses });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { title: string; subtitle: string; roleKeys: string[]; createdBy?: string };
    const { title, subtitle, roleKeys, createdBy } = body;
    if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const base = slugify(title);
    let id = base;
    for (let n = 2; ; n++) {
      const { data: existing } = await supabase.from("admin_courses").select("id").eq("id", id).maybeSingle();
      if (!existing && !STATIC_SLUGS.has(id)) break;
      id = `${base}-${n}`;
    }

    const createdAt = new Date().toISOString();
    const { error } = await supabase.from("admin_courses").insert({
      id,
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      role_keys: roleKeys || [],
      created_by: createdBy || null,
      created_at: createdAt,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const course: Course = {
      slug: id,
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      roleKeys: roleKeys || [],
      sections: [],
      isCustom: true,
      createdBy,
      createdAt,
    };
    return NextResponse.json({ ok: true, course });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: Request) {
  try {
    const course = (await req.json()) as Course;
    if (!course.slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const { error: courseErr } = await supabase
      .from("admin_courses")
      .update({ title: course.title, subtitle: course.subtitle, role_keys: course.roleKeys || [] })
      .eq("id", course.slug);
    if (courseErr) return NextResponse.json({ error: courseErr.message }, { status: 500 });

    // Full replace of the section/item/substep tree, done atomically in a single
    // DB round trip via a Postgres function — see admin_courses_replace_tree in
    // supabase/schema.sql. (Previously this looped one awaited insert per row,
    // which was slow and non-atomic: a failure partway left the course with a
    // truncated, corrupted tree and no rollback.)
    const { error: treeErr } = await supabase.rpc("admin_courses_replace_tree", {
      p_course_id: course.slug,
      p_sections: course.sections,
    });
    if (treeErr) return NextResponse.json({ error: treeErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("admin_courses").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // course_progress isn't FK-linked to admin_courses (it also covers slugs
    // that never had an admin_courses row), so clean up its rows explicitly —
    // otherwise they'd sit as permanent orphans, and a future course reusing
    // the same slug would silently inherit this one's old progress.
    await supabase.from("course_progress").delete().eq("course_slug", id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
