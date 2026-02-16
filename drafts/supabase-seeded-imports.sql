-- Seeded imports + provenance (idempotent)
-- Run in Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

-- 1) Import runs (audit + purge)
create table if not exists public.seed_import_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid null, -- auth.users(id) if available

  source_type text not null, -- e.g. 'x', 'github', 'manual'
  source_url text null,

  input_text text null,
  input_json jsonb null,

  status text not null default 'pending', -- pending|applied|failed|purged
  error text null,

  applied_at timestamptz null,
  purged_at timestamptz null
);

create index if not exists seed_import_runs_created_at_idx on public.seed_import_runs (created_at desc);
create index if not exists seed_import_runs_source_idx on public.seed_import_runs (source_type, created_at desc);

-- 2) Provenance columns on ships (additive)
alter table public.ships
  add column if not exists source_type text null,
  add column if not exists source_ref text null,
  add column if not exists seeded_import_run_id uuid null references public.seed_import_runs(id) on delete set null,
  add column if not exists seeded_at timestamptz null,
  add column if not exists seeded_by uuid null;

-- Enforce no duplicates for seeded imports (nullable-friendly unique index)
create unique index if not exists ships_source_type_ref_uniq
  on public.ships (source_type, source_ref)
  where source_type is not null and source_ref is not null;

create index if not exists ships_seeded_import_run_idx
  on public.ships (seeded_import_run_id)
  where seeded_import_run_id is not null;

-- 3) Claim status on agents (optional but needed for UI badges)
alter table public.agents
  add column if not exists claim_status text null, -- unclaimed|claimed|verified
  add column if not exists claimed_at timestamptz null,
  add column if not exists claimed_by uuid null,
  add column if not exists source_type text null,
  add column if not exists source_ref text null,
  add column if not exists seeded_import_run_id uuid null references public.seed_import_runs(id) on delete set null;

create unique index if not exists agents_source_type_ref_uniq
  on public.agents (source_type, source_ref)
  where source_type is not null and source_ref is not null;

create index if not exists agents_claim_status_idx
  on public.agents (claim_status, first_seen desc)
  where claim_status is not null;

-- 4) RLS: admin-only access
-- Requires public.is_admin() helper from drafts/supabase-admin-users-rls.sql
alter table public.seed_import_runs enable row level security;

drop policy if exists "seed_import_runs_admin_read" on public.seed_import_runs;
create policy "seed_import_runs_admin_read"
on public.seed_import_runs
for select
to authenticated
using (public.is_admin());

drop policy if exists "seed_import_runs_admin_write" on public.seed_import_runs;
create policy "seed_import_runs_admin_write"
on public.seed_import_runs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
