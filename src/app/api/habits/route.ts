import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Habit } from "@/types/habits";
import type { Profile } from "@/config/access";
import { todayKey } from "@/lib/dateKey";

function rowToHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    durationDays: row.duration_days as number,
    startDate: row.start_date as string,
    createdBy: row.created_by as Profile,
    createdAt: row.created_at as string,
    checkIns: (row.check_ins as Habit["checkIns"]) || {},
  };
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ habits: data.map(rowToHabit) });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    description?: string;
    durationDays: number;
    startDate?: string;
    createdBy: Profile;
  };
  const { title, description, durationDays, createdBy } = body;
  if (!title?.trim() || !createdBy) {
    return NextResponse.json({ error: "title and createdBy are required" }, { status: 400 });
  }
  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    return NextResponse.json({ error: "durationDays must be a positive integer" }, { status: 400 });
  }

  const habit: Habit = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description?.trim() || undefined,
    durationDays,
    startDate: body.startDate || todayKey(),
    createdBy,
    createdAt: new Date().toISOString(),
    checkIns: {},
  };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("habits").insert({
    id: habit.id,
    title: habit.title,
    description: habit.description ?? null,
    duration_days: habit.durationDays,
    start_date: habit.startDate,
    created_by: habit.createdBy,
    created_at: habit.createdAt,
    check_ins: habit.checkIns,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, habit });
}

// Partial update — only the keys present in `patch` are touched.
const PATCHABLE_FIELDS: Record<string, string> = {
  title: "title",
  description: "description",
  checkIns: "check_ins",
};

export async function PUT(req: Request) {
  const body = (await req.json()) as { id: string; patch: Record<string, unknown> };
  const { id, patch } = body;
  if (!id || !patch) return NextResponse.json({ error: "id and patch are required" }, { status: 400 });
  if ("title" in patch && !(patch.title as string)?.trim()) {
    return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(PATCHABLE_FIELDS)) {
    if (key in patch) update[column] = patch[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no patchable fields provided" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("habits").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
