-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: drops and recreates the progress table since it only ever
-- held placeholder zeros before this per-profile redesign.

drop table if exists progress;

create table progress (
  role_key text not null,
  profile text not null check (profile in ('jagadesh', 'harshita')),
  researched boolean not null default false,
  researched_at timestamptz,
  interested boolean not null default false,
  interested_at timestamptz,
  completed boolean not null default false,
  completed_at timestamptz,
  saved boolean not null default false,
  saved_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (role_key, profile)
);

create table if not exists resources (
  id text primary key,
  role_key text not null,
  type text not null check (type in ('youtube', 'article', 'course', 'docs', 'other')),
  title text not null,
  url text not null,
  added_at timestamptz not null default now()
);

create index if not exists resources_role_key_idx on resources (role_key);

create table if not exists project_ideas (
  id text primary key,
  title text not null,
  description text not null,
  domains text[] not null default '{}',
  role_keys text[] not null default '{}',
  created_by text not null check (created_by in ('jagadesh', 'harshita')),
  created_at timestamptz not null default now()
);
alter table project_ideas add column if not exists domains text[] not null default '{}';

create table if not exists research_papers (
  id text primary key,
  title text not null,
  abstract text not null,
  status text not null default 'idea' check (status in ('idea', 'drafting', 'submitted', 'published')),
  link text,
  domains text[] not null default '{}',
  role_keys text[] not null default '{}',
  created_by text not null check (created_by in ('jagadesh', 'harshita')),
  created_at timestamptz not null default now()
);

create table if not exists freelance_gigs (
  id text primary key,
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'applied', 'in-progress', 'completed')),
  link text,
  budget text,
  domains text[] not null default '{}',
  role_keys text[] not null default '{}',
  created_by text not null check (created_by in ('jagadesh', 'harshita')),
  created_at timestamptz not null default now()
);

-- Admin-authored courses (Admin panel > Courses) — a course is a tree of
-- sections (topics) -> items (sub-topics) -> substeps (learning points, each
-- with its own "what you'll learn" text, a typed resource link the admin
-- picks, and a ChatGPT prompt). Separate from the static reference "AWS"
-- course bundled in the app code, which is untouched by this.
create table if not exists admin_courses (
  id text primary key,
  title text not null,
  subtitle text not null,
  role_keys text[] not null default '{}',
  created_by text check (created_by in ('jagadesh', 'harshita')),
  created_at timestamptz not null default now()
);
alter table admin_courses add column if not exists created_by text check (created_by in ('jagadesh', 'harshita'));

create table if not exists admin_course_sections (
  id text primary key,
  course_id text not null references admin_courses(id) on delete cascade,
  title text not null,
  note text,
  priority smallint not null default 4 check (priority in (5, 4, 0)),
  track text not null default 'core' check (track in ('core', 'backend', 'data', 'ai', 'infra')),
  sort_order int not null default 0
);

create table if not exists admin_course_items (
  id text primary key,
  section_id text not null references admin_course_sections(id) on delete cascade,
  title text not null,
  whole_prompt text not null default '',
  sort_order int not null default 0
);

create table if not exists admin_course_substeps (
  id text primary key,
  item_id text not null references admin_course_items(id) on delete cascade,
  label text not null,
  what_you_learn text not null default '',
  resource_type text not null default 'article' check (resource_type in ('youtube', 'article', 'docs', 'course', 'other')),
  resource_url text not null default '',
  prompt text not null default '',
  sort_order int not null default 0
);

create index if not exists admin_course_sections_course_id_idx on admin_course_sections (course_id);
create index if not exists admin_course_items_section_id_idx on admin_course_items (section_id);
create index if not exists admin_course_substeps_item_id_idx on admin_course_substeps (item_id);

-- Replaces a course's entire section/item/substep tree in one atomic call
-- (the whole function body runs in a single transaction — if anything fails,
-- the delete and every insert before it roll back together). Called from
-- PUT /api/admin-courses instead of looping one awaited insert per row.
create or replace function admin_courses_replace_tree(p_course_id text, p_sections jsonb)
returns void
language plpgsql
as $$
begin
  delete from admin_course_sections where course_id = p_course_id;

  insert into admin_course_sections (id, course_id, title, note, priority, track, sort_order)
  select
    sec->>'id',
    p_course_id,
    sec->>'title',
    sec->>'note',
    (sec->>'priority')::smallint,
    sec->>'track',
    (sec_ord - 1)::int
  from jsonb_array_elements(p_sections) with ordinality as t(sec, sec_ord);

  insert into admin_course_items (id, section_id, title, whole_prompt, sort_order)
  select
    item->>'id',
    sec->>'id',
    item->>'title',
    coalesce(item->>'wholePrompt', ''),
    (item_ord - 1)::int
  from jsonb_array_elements(p_sections) with ordinality as t(sec, sec_ord),
       lateral jsonb_array_elements(coalesce(sec->'customItems', '[]'::jsonb)) with ordinality as ti(item, item_ord);

  insert into admin_course_substeps (id, item_id, label, what_you_learn, resource_type, resource_url, prompt, sort_order)
  select
    sub->>'id',
    item->>'id',
    sub->>'label',
    coalesce(sub->>'whatYouLearn', ''),
    coalesce(sub->>'resourceType', 'article'),
    coalesce(sub->>'resourceUrl', ''),
    coalesce(sub->>'prompt', ''),
    (sub_ord - 1)::int
  from jsonb_array_elements(p_sections) with ordinality as t(sec, sec_ord),
       lateral jsonb_array_elements(coalesce(sec->'customItems', '[]'::jsonb)) with ordinality as ti(item, item_ord),
       lateral jsonb_array_elements(coalesce(item->'substeps', '[]'::jsonb)) with ordinality as si(sub, sub_ord);
end;
$$;

-- Per-profile course checklist progress — one row per completed sub-task,
-- for BOTH static reference courses (e.g. "aws") and admin-authored ones.
-- Only "done" sub-tasks are stored; unchecking deletes the row.
create table if not exists course_progress (
  course_slug text not null,
  profile text not null check (profile in ('jagadesh', 'harshita')),
  progress_key text not null,
  updated_at timestamptz not null default now(),
  primary key (course_slug, profile, progress_key)
);

-- Holds the shared site password as a salted hash (never plaintext) so it
-- lives in the database instead of the git repo. Seeded below with a random
-- one-time bootstrap password (its plaintext is not stored anywhere in this
-- repo) — change it from Settings the first time you unlock the app.
create table if not exists app_settings (
  key text primary key,
  value text not null
);

insert into app_settings (key, value)
values ('site_password_hash', '02512664af010efb668561cba0080658:a4e0b8522d1a68a629627c8898c41ca4780a461fccb86bda3c4399ba59147f104983f649d8efa69cb991e90fe504a93efff778e8abd806cb09ac3045c67c352c')
on conflict (key) do nothing;

alter table progress enable row level security;
alter table resources enable row level security;
alter table project_ideas enable row level security;
alter table research_papers enable row level security;
alter table freelance_gigs enable row level security;
alter table admin_courses enable row level security;
alter table admin_course_sections enable row level security;
alter table admin_course_items enable row level security;
alter table admin_course_substeps enable row level security;
alter table course_progress enable row level security;
alter table app_settings enable row level security;

-- No policies are defined, so the public Data API (anon/authenticated keys)
-- is denied by default. Only the server, using the service role key (which
-- bypasses RLS), can read or write these tables — the app's own password
-- gate is what protects access from there.
