import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ProgressRecord, ProgressState } from "@/types/career";
import type { Profile } from "@/config/access";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("progress").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const progress: ProgressState = {};
  for (const row of data) {
    const entry = progress[row.role_key] || {};
    entry[row.profile as Profile] = {
      researched: row.researched,
      researchedAt: row.researched_at ?? undefined,
      interested: row.interested,
      interestedAt: row.interested_at ?? undefined,
      completed: row.completed,
      completedAt: row.completed_at ?? undefined,
      saved: row.saved,
      savedAt: row.saved_at ?? undefined,
      notes: row.notes ?? undefined,
    };
    progress[row.role_key] = entry;
  }
  return NextResponse.json({ progress });
}

export async function PUT(req: Request) {
  const body = (await req.json()) as { roleKey: string; profile: Profile; record: ProgressRecord };
  const { roleKey, profile, record } = body;
  if (!roleKey || !profile) {
    return NextResponse.json({ error: "roleKey and profile are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("progress").upsert({
    role_key: roleKey,
    profile,
    researched: record.researched ?? false,
    researched_at: record.researchedAt ?? null,
    interested: record.interested ?? false,
    interested_at: record.interestedAt ?? null,
    completed: record.completed ?? false,
    completed_at: record.completedAt ?? null,
    saved: record.saved ?? false,
    saved_at: record.savedAt ?? null,
    notes: record.notes ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
