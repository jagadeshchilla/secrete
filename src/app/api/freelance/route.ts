import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { FreelanceGig, FreelanceStatus } from "@/types/freelance";
import type { Profile } from "@/config/access";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("freelance_gigs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const gigs: FreelanceGig[] = data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    link: row.link ?? undefined,
    budget: row.budget ?? undefined,
    domains: row.domains || [],
    roleKeys: row.role_keys || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ gigs });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    description: string;
    status: FreelanceStatus;
    link?: string;
    budget?: string;
    domains: string[];
    roleKeys: string[];
    createdBy: Profile;
  };
  const { title, description, status, link, budget, domains, roleKeys, createdBy } = body;
  if (!title?.trim() || !description?.trim() || !roleKeys?.length || !createdBy) {
    return NextResponse.json(
      { error: "title, description, roleKeys and createdBy are required" },
      { status: 400 }
    );
  }

  const gig: FreelanceGig = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description.trim(),
    status: status || "open",
    link: link?.trim() || undefined,
    budget: budget?.trim() || undefined,
    domains: domains || [],
    roleKeys,
    createdBy,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("freelance_gigs").insert({
    id: gig.id,
    title: gig.title,
    description: gig.description,
    status: gig.status,
    link: gig.link ?? null,
    budget: gig.budget ?? null,
    domains: gig.domains,
    role_keys: gig.roleKeys,
    created_by: gig.createdBy,
    created_at: gig.createdAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gig });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as { id: string; status: FreelanceStatus };
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("freelance_gigs").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("freelance_gigs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
