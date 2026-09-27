import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ProjectIdea } from "@/types/ideas";
import type { Profile } from "@/config/access";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("project_ideas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ideas: ProjectIdea[] = data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    domains: row.domains || [],
    roleKeys: row.role_keys || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ ideas });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    description: string;
    domains: string[];
    roleKeys: string[];
    createdBy: Profile;
  };
  const { title, description, domains, roleKeys, createdBy } = body;
  if (!title?.trim() || !description?.trim() || !roleKeys?.length || !createdBy) {
    return NextResponse.json(
      { error: "title, description, roleKeys and createdBy are required" },
      { status: 400 }
    );
  }

  const idea: ProjectIdea = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description.trim(),
    domains: domains || [],
    roleKeys,
    createdBy,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("project_ideas").insert({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    domains: idea.domains,
    role_keys: idea.roleKeys,
    created_by: idea.createdBy,
    created_at: idea.createdAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, idea });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("project_ideas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
