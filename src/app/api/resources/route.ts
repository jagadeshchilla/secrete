import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { LearningResource, ResourceState, ResourceType } from "@/types/resources";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("resources").select("*").order("added_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const resources: ResourceState = {};
  for (const row of data) {
    const entry: LearningResource = {
      id: row.id,
      title: row.title,
      url: row.url,
      type: row.type,
      addedAt: row.added_at,
    };
    resources[row.role_key] = [...(resources[row.role_key] || []), entry];
  }
  return NextResponse.json({ resources });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { roleKey: string; title: string; url: string; type: ResourceType };
  const { roleKey, title, url, type } = body;
  if (!roleKey || !title || !url || !type) {
    return NextResponse.json({ error: "roleKey, title, url and type are required" }, { status: 400 });
  }

  const entry: LearningResource = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    url,
    type,
    addedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("resources").insert({
    id: entry.id,
    role_key: roleKey,
    type: entry.type,
    title: entry.title,
    url: entry.url,
    added_at: entry.addedAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, resource: entry });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
