-- Site settings table (idempotent)

create table if not exists public.site_settings (
  key text primary key,
  value_bool boolean,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_site_settings() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at_site_settings();

-- RLS: default deny; allow admins to read/write
alter table public.site_settings enable row level security;

-- Helper is_admin() is created in drafts/supabase-admin-users-rls.sql

drop policy if exists "site_settings_admin_read" on public.site_settings;
create policy "site_settings_admin_read"
on public.site_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed default
insert into public.site_settings(key, value_bool)
values ('sponsors_enabled', false)
on conflict (key) do nothing;
