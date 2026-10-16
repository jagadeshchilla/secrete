import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ProjectIdea } from "@/types/ideas";
import type { Profile } from "@/config/access";

function rowToIdea(row: Record<string, unknown>): ProjectIdea {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    domains: (row.domains as string[]) || [],
    roleKeys: (row.role_keys as string[]) || [],
    createdBy: row.created_by as Profile,
    createdAt: row.created_at as string,
    feasible: (row.feasible as boolean | null) ?? null,
    infeasibleReason: (row.infeasible_reason as string) ?? undefined,
    researchTopics: (row.research_topics as string[]) || [],
    dataSources: (row.data_sources as ProjectIdea["dataSources"]) || [],
    methods: (row.methods as string[]) || [],
    techStack: (row.tech_stack as string[]) || [],
    tasks: (row.tasks as ProjectIdea["tasks"]) || [],
    targetDate: (row.target_date as string) ?? undefined,
    blockers: (row.blockers as string) ?? undefined,
    outcomeNotes: (row.outcome_notes as string) ?? undefined,
    researchPaperLink: (row.research_paper_link as string) ?? undefined,
    done: row.done as boolean,
  };
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("project_ideas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ideas: data.map(rowToIdea) });
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
  if (!title?.trim() || !description?.trim() || !createdBy) {
    return NextResponse.json({ error: "title, description and createdBy are required" }, { status: 400 });
  }

  // Feasibility and the rest of the workflow are decided later, while
  // viewing the idea — not at creation time.
  const idea: ProjectIdea = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description.trim(),
    domains: domains || [],
    roleKeys: roleKeys || [],
    createdBy,
    createdAt: new Date().toISOString(),
    feasible: null,
    researchTopics: [],
    dataSources: [],
    methods: [],
    techStack: [],
    tasks: [],
    done: false,
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
    feasible: idea.feasible,
    done: idea.done,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, idea });
}

// Partial update — only the keys present in `patch` are touched, so the
// client can send e.g. just { tasks } to toggle one checkbox without
// resending the whole idea.
const PATCHABLE_FIELDS: Record<string, string> = {
  researchTopics: "research_topics",
  dataSources: "data_sources",
  methods: "methods",
  techStack: "tech_stack",
  tasks: "tasks",
  targetDate: "target_date",
  blockers: "blockers",
  outcomeNotes: "outcome_notes",
  researchPaperLink: "research_paper_link",
  done: "done",
  feasible: "feasible",
  infeasibleReason: "infeasible_reason",
};

export async function PUT(req: Request) {
  const body = (await req.json()) as { id: string; patch: Record<string, unknown> };
  const { id, patch } = body;
  if (!id || !patch) return NextResponse.json({ error: "id and patch are required" }, { status: 400 });
  if (patch.feasible === false && !(patch.infeasibleReason as string | undefined)?.trim()) {
    return NextResponse.json({ error: "infeasibleReason is required when feasible is false" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(PATCHABLE_FIELDS)) {
    if (key in patch) update[column] = patch[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no patchable fields provided" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("project_ideas").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
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
