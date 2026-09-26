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
-- lives in the database instead of the git repo. Seeded below with the
-- current default password, "changeme" — change it from Settings once the
-- app is running.
create table if not exists app_settings (
  key text primary key,
  value text not null
);

insert into app_settings (key, value)
values ('site_password_hash', 'bc304f3013a91393fc46188702cb8e11:628fa9a830f1e3f4ee6b8812b43f47b857086eb48726408a584d35576883467dc453521bedd4185b7f7a9ce96b2d8e682c349cb93006afbcaaf7977fc250e17d')
on conflict (key) do nothing;

alter table progress enable row level security;
alter table resources enable row level security;
alter table app_settings enable row level security;

-- No policies are defined, so the public Data API (anon/authenticated keys)
-- is denied by default. Only the server, using the service role key (which
-- bypasses RLS), can read or write these tables — the app's own password
-- gate is what protects access from there.
