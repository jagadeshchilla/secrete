import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ResearchPaper, ResearchStatus } from "@/types/research";
import type { Profile } from "@/config/access";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("research_papers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const papers: ResearchPaper[] = data.map((row) => ({
    id: row.id,
    title: row.title,
    abstract: row.abstract,
    status: row.status,
    link: row.link ?? undefined,
    domains: row.domains || [],
    roleKeys: row.role_keys || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ papers });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    abstract: string;
    status: ResearchStatus;
    link?: string;
    domains: string[];
    roleKeys: string[];
    createdBy: Profile;
  };
  const { title, abstract, status, link, domains, roleKeys, createdBy } = body;
  if (!title?.trim() || !abstract?.trim() || !roleKeys?.length || !createdBy) {
    return NextResponse.json(
      { error: "title, abstract, roleKeys and createdBy are required" },
      { status: 400 }
    );
  }

  const paper: ResearchPaper = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    abstract: abstract.trim(),
    status: status || "idea",
    link: link?.trim() || undefined,
    domains: domains || [],
    roleKeys,
    createdBy,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("research_papers").insert({
    id: paper.id,
    title: paper.title,
    abstract: paper.abstract,
    status: paper.status,
    link: paper.link ?? null,
    domains: paper.domains,
    role_keys: paper.roleKeys,
    created_by: paper.createdBy,
    created_at: paper.createdAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, paper });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as { id: string; status: ResearchStatus };
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("research_papers").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("research_papers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
