import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Profile } from "@/config/access";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const profile = searchParams.get("profile");
  if (!slug || !profile) return NextResponse.json({ error: "slug and profile are required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("course_progress")
    .select("progress_key")
    .eq("course_slug", slug)
    .eq("profile", profile);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const progress: Record<string, boolean> = {};
  data.forEach((row) => {
    progress[row.progress_key] = true;
  });
  return NextResponse.json({ progress });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as { slug: string; profile: Profile; key: string; done: boolean };
  const { slug, profile, key, done } = body;
  if (!slug || !profile || !key) {
    return NextResponse.json({ error: "slug, profile and key are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (done) {
    const { error } = await supabase
      .from("course_progress")
      .upsert({ course_slug: slug, profile, progress_key: key, updated_at: new Date().toISOString() });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("course_progress")
      .delete()
      .eq("course_slug", slug)
      .eq("profile", profile)
      .eq("progress_key", key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
