-- App settings (idempotent)
-- Run in Supabase SQL editor.

create table if not exists public.app_settings (
  key text primary key,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- NOTE: This repo uses an admin-users pattern. Reuse your admin check function/policy.
-- If you already have public.is_admin(uid) or similar, swap it in below.

-- Example policies (edit to match your setup):
-- drop policy if exists "app_settings_admin_read" on public.app_settings;
-- create policy "app_settings_admin_read" on public.app_settings
-- for select
-- using (public.is_admin(auth.uid()));

-- drop policy if exists "app_settings_admin_write" on public.app_settings;
-- create policy "app_settings_admin_write" on public.app_settings
-- for insert
-- with check (public.is_admin(auth.uid()));

-- drop policy if exists "app_settings_admin_update" on public.app_settings;
-- create policy "app_settings_admin_update" on public.app_settings
-- for update
-- using (public.is_admin(auth.uid()))
-- with check (public.is_admin(auth.uid()));
