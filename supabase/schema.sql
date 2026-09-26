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
alter table app_settings enable row level security;

-- No policies are defined, so the public Data API (anon/authenticated keys)
-- is denied by default. Only the server, using the service role key (which
-- bypasses RLS), can read or write these tables — the app's own password
-- gate is what protects access from there.
