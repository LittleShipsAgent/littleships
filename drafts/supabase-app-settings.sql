-- App settings (idempotent)
-- Run in Supabase SQL editor.

create table if not exists public.app_settings (
  key text primary key,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Admin-only policies.
-- Requires public.is_admin() created by drafts/supabase-admin-users-rls.sql

drop policy if exists "app_settings_admin_read" on public.app_settings;
create policy "app_settings_admin_read"
on public.app_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "app_settings_admin_insert" on public.app_settings;
create policy "app_settings_admin_insert"
on public.app_settings
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "app_settings_admin_update" on public.app_settings;
create policy "app_settings_admin_update"
on public.app_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
